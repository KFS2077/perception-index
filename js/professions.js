import logger from './logger.js';
import { 
    supabase, 
    currentProfessionId, 
    currentPage, 
    isLoading, 
    hasMoreProfessions, 
    professionObserver,
    popularListEl,
    professionLoader,
    totalVotesEl,
    avgPerceptionEl,
    professionCountEl,
    activityFeedEl,
    professionModal,
    professionDetails,
    setCurrentProfessionId,
    setCurrentPage,
    setIsLoading,
    setHasMoreProfessions,
    setProfessionObserver,
    currentLanguage,
    categories
} from './config.js';
import { showToast, showError, showMessage, animateCounter, closeModals } from './ui.js';
import { getStarsHTML, formatTime } from './utils.js';
import { loadCategoryChart } from './charts.js';
import translations from './i18n.js';

// Load popular professions
async function loadPopularProfessions() {
    try {
        logger.db('Query', 'Fetching popular professions (ordered by rating count)');
        
        // Initialize the page and loading state for infinite scroll
        setCurrentPage(1);
        setIsLoading(false);
        setHasMoreProfessions(true);
        
        const {data, error} = await supabase
            .from('professions')
            .select('*')
            .order('total_ratings', {ascending: false})
            .limit(8);

        if (error) throw error;
        logger.db('Success', `Retrieved ${data.length} popular professions`);

        popularListEl.innerHTML = '';

        if (data.length === 0) {
            popularListEl.innerHTML = `<div class="loading">${translations[currentLanguage]?.noData || 'No data available'}</div>`;
            return;
        }

        data.forEach((profession, index) => {
            const card = createProfessionCard(profession);
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());
            popularListEl.appendChild(card);
        });

        // Setup infinite scroll to load more
        setupInfiniteScroll();

        logger.success('Popular professions loaded successfully');
    } catch (error) {
        logger.error('Failed to load popular professions', error);
        popularListEl.innerHTML = `<div class="loading">${translations[currentLanguage]?.loadFailed || 'Loading failed, please refresh'}</div>`;
    }
}

// Create profession card element
function createProfessionCard(profession) {
    const card = document.createElement('div');
    card.className = 'profession-card';
    card.dataset.id = profession.id;

    const stars = getStarsHTML(profession.avg_rating);

    card.innerHTML = `
        <div class="card-header">
            <h3>${profession.name}</h3>
            <span class="category-badge">${profession.category}</span>
        </div>
        <div class="card-body">
            <div class="rating">
                <div class="stars">${stars}</div>
                <div class="value">${profession.avg_rating ? profession.avg_rating.toFixed(1) : '0.0'}</div>
            </div>
            <div class="stats">
                <span>${profession.total_ratings || 0} ${translations[currentLanguage]?.ratings || ''}</span>
                <span>${profession.comments_count || 0} ${translations[currentLanguage]?.comments || ''}</span>
            </div>
        </div>
    `;

    // Ensure event listener works by adding it after innerHTML is set
    setTimeout(() => {
        card.addEventListener('click', function() {
            showProfessionDetails(profession.id);
        });
        // Make it visually look clickable
        card.style.cursor = 'pointer';
    }, 0);

    return card;
}

// Show profession details
async function showProfessionDetails(professionId) {
    try {
        setCurrentProfessionId(professionId);
        logger.info(`Viewing profession details: ID=${professionId}`);
        
        // Show the modal first to improve perceived performance
        professionModal.style.display = 'flex';
        
        logger.db('Query', `Fetching profession details: ID=${professionId}`);
        // Get profession details
        const {data: profession, error: professionError} = await supabase
            .from('professions')
            .select('*')
            .eq('id', professionId)
            .single();

        if (professionError) throw professionError;
        logger.db('Success', `Profession details: ${profession.category} > ${profession.name}`);

        logger.db('Query', 'Fetching latest comments');
        // Get comments for this profession
        const {data: messages, error: messagesError} = await supabase
            .from('messages')
            .select('*')
            .eq('profession_id', professionId)
            .order('created_at', {ascending: false})
            .limit(10);

        if (messagesError) throw messagesError;
        logger.db('Success', `Retrieved ${messages.length} comments`);
        
        // Check if current user has already voted
        const deviceId = getOrCreateDeviceId();
        const { data: existingVote, error: checkError } = await supabase
            .from('ratings')
            .select('id')
            .eq('profession_id', professionId)
            .eq('device_id', deviceId)
            .limit(1);
            
        if (checkError) throw checkError;
        const hasVoted = existingVote && existingVote.length > 0;

        // Convert the avg_rating (1-5 scale) to a percentage (0-100)
        const percentageValue = profession.avg_rating ? Math.round((profession.avg_rating - 1) / 4 * 100) : 50;

        // Create details HTML
        professionDetails.innerHTML = `
            <div class="profession-header">
                <h2 class="profession-title">${profession.name}</h2>
                <span class="category-badge">${profession.category}</span>
            </div>
            
            <div class="profession-description">
                ${profession.description || translations[currentLanguage]?.noDescription || ''}
            </div>
            
            <div class="agi-awareness-section">
                <h3>${translations[currentLanguage]?.agiAwarenessQuestion || ''}</h3>
                <p class="slider-instruction">${translations[currentLanguage]?.sliderInstruction || ''}</p>
                
                <div class="perception-slider-container">
                    <div class="percentage-display">
                        <span class="percentage-value">${percentageValue}%</span>
                    </div>
                    
                    <div class="perception-slider-wrapper">
                        <input type="range" min="0" max="100" value="${hasVoted ? percentageValue : 50}" class="perception-slider" id="agi-perception-slider" ${hasVoted ? 'disabled' : ''}>
                        <div class="perception-slider-track"></div>
                        <div class="slider-thumb" id="slider-thumb"></div>
                    </div>
                    
                    <div class="perception-levels">
                        <div class="perception-level" data-range="0-25">
                            <div class="level-label">${translations[currentLanguage]?.levelBasic || ''}</div>
                            <div class="level-description">${translations[currentLanguage]?.levelBasicDesc || ''}</div>
                        </div>
                        <div class="perception-level" data-range="26-50">
                            <div class="level-label">${translations[currentLanguage]?.levelIntermediate || ''}</div>
                            <div class="level-description">${translations[currentLanguage]?.levelIntermediateDesc || ''}</div>
                        </div>
                        <div class="perception-level" data-range="51-75">
                            <div class="level-label">${translations[currentLanguage]?.levelAdvanced || ''}</div>
                            <div class="level-description">${translations[currentLanguage]?.levelAdvancedDesc || ''}</div>
                        </div>
                        <div class="perception-level" data-range="76-100">
                            <div class="level-label">${translations[currentLanguage]?.levelExpert || ''}</div>
                            <div class="level-description">${translations[currentLanguage]?.levelExpertDesc || ''}</div>
                        </div>
                    </div>
                </div>
                
                <div class="vote-button-container">
                    <button id="submit-perception" class="vote-button" ${hasVoted ? 'disabled' : ''}>${hasVoted ? (translations[currentLanguage]?.alreadyVoted || 'Already Voted') : (translations[currentLanguage]?.submitRating || '')}</button>
                    <div id="rating-message" class="rating-message">${hasVoted ? (translations[currentLanguage]?.voteRegistered || 'Your vote has been registered') : ''}</div>
                </div>
            </div>
            
            <div class="stats-section">
                <div class="current-rating">
                    <h4>${translations[currentLanguage]?.currentRating || ''}</h4>
                    <div class="rating-display">${profession.avg_rating.toFixed(1)} ${getStarsHTML(profession.avg_rating)}</div>
                </div>
                <div class="total-votes">
                    <h4>${translations[currentLanguage]?.ratingParticipants || ''}</h4>
                    <div class="votes-count">${profession.total_ratings}</div>
                </div>
            </div>
            
            <div class="comments-section">
                <h3>${translations[currentLanguage]?.commentsBoard || ''}</h3>
                <div class="comment-list" id="comment-list">
                    ${messages.length === 0 ? `<div class="loading">${translations[currentLanguage]?.noComments || ''}</div>` : ''}
                </div>
                
                <form class="comment-form" id="comment-form">
                    <textarea id="comment-input" placeholder="${translations[currentLanguage]?.shareYourThoughts || ''}" rows="3" required></textarea>
                    <button type="submit">${translations[currentLanguage]?.sendComment || ''}</button>
                </form>
            </div>
        `;
        
        // Populate comments
        const commentList = document.getElementById('comment-list');
        if (commentList) {
            commentList.innerHTML = '';
            
            if (messages && messages.length > 0) {
                messages.forEach(message => {
                    const comment = document.createElement('div');
                    comment.className = 'comment-item';

                    const time = formatTime(new Date(message.created_at));

                    comment.innerHTML = `
                        <div class="comment-header">
                            <div class="comment-author">${message.username}</div>
                            <div class="comment-time">${time}</div>
                        </div>
                        <div class="comment-content">${message.content}</div>
                    `;

                    commentList.appendChild(comment);
                });
            } else {
                commentList.innerHTML = `<div class="loading">${translations[currentLanguage]?.noComments || 'No comments yet'}</div>`;
            }
        }

        // Add event listener for slider movement
        const slider = document.getElementById('agi-perception-slider');
        const percentageValueDisplay = document.querySelector('.percentage-value');
        const sliderThumb = document.getElementById('slider-thumb');
        const submitPerceptionBtn = document.getElementById('submit-perception');
        const ratingMessage = document.getElementById('rating-message');
        
        // Initialize slider position and values
        const initialValue = slider.value;
        percentageValueDisplay.textContent = `${initialValue}%`;
        
        // Update the position of the custom thumb for initial value
        const initialPercentage = (initialValue - slider.min) / (slider.max - slider.min);
        const initialThumbPosition = initialPercentage * (slider.offsetWidth - sliderThumb.offsetWidth);
        sliderThumb.style.left = `${initialThumbPosition}px`;
        
        // Set initial level highlighting
        document.querySelectorAll('.perception-level').forEach(level => {
            const range = level.getAttribute('data-range').split('-');
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);
            
            if (initialValue >= min && initialValue <= max) {
                level.classList.add('active');
            } else {
                level.classList.remove('active');
            }
        });
        
        let hasInteractedWithSlider = false;
        
        slider.addEventListener('input', () => {
            const value = slider.value;
            percentageValueDisplay.textContent = `${value}%`;
            
            // Update the position of the custom thumb
            const percentage = (value - slider.min) / (slider.max - slider.min);
            const thumbPosition = percentage * (slider.offsetWidth - sliderThumb.offsetWidth);
            sliderThumb.style.left = `${thumbPosition}px`;
            
            // Highlight the current level
            document.querySelectorAll('.perception-level').forEach(level => {
                const range = level.getAttribute('data-range').split('-');
                const min = parseInt(range[0]);
                const max = parseInt(range[1]);
                
                if (value >= min && value <= max) {
                    level.classList.add('active');
                } else {
                    level.classList.remove('active');
                }
            });
            
            // Enable submit button after user interacts with slider
            if (!hasInteractedWithSlider) {
                hasInteractedWithSlider = true;
                submitPerceptionBtn.disabled = false;
                ratingMessage.textContent = translations[currentLanguage]?.readyToSubmit || 'Ready to submit your rating';
            }
        });

        // Add event listeners for submission
        submitPerceptionBtn.addEventListener('click', () => {
            const perceptionValue = parseInt(document.getElementById('agi-perception-slider').value);
            // Use a simple 5-point scale (1-5 integers only)
            const rating = Math.min(5, Math.max(1, Math.round(1 + (perceptionValue / 100) * 4)));
            submitRating(professionId, perceptionValue);
        });

        const commentForm = document.getElementById('comment-form');
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = document.getElementById('comment-input').value.trim();
            if (content) {
                submitComment(content);
            }
        });

        // Show modal
        professionModal.style.display = 'block';
        logger.success('Profession details loaded successfully');
    } catch (error) {
        logger.error('Failed to load profession details', error);
    }
}

// Load more professions for infinite scroll
async function loadMoreProfessions() {
    if (isLoading || !hasMoreProfessions) return;

    setIsLoading(true);
    setCurrentPage(currentPage + 1);
    professionLoader.classList.add('active');

    try {
        const offset = (currentPage - 1) * 8;
        
        logger.db('Query', `Loading more professions (page ${currentPage}, offset ${offset})`);
        
        const { data, error } = await supabase
            .from('professions')
            .select('*')
            .order('total_ratings', { ascending: false})
            .range(offset, offset + 7);

        if (error) throw error;
        
        logger.db('Success', `Retrieved ${data.length} additional professions`);

        if (data.length === 0) {
            setHasMoreProfessions(false);
            professionLoader.classList.remove('active');
            logger.info('No more professions to load');
            return;
        }

        // Add some delay to make the loading more visible
        setTimeout(() => {
            data.forEach(profession => {
                const card = createProfessionCard(profession);
                card.setAttribute('data-aos', 'fade-up');
                popularListEl.appendChild(card);
            });

            // Refresh AOS for new elements
            AOS.refresh();
            professionLoader.classList.remove('active');
            setIsLoading(false);
        }, 800);
    } catch (error) {
        logger.error('Failed to load more professions', error);
        showToast('error', translations[currentLanguage]?.loadFailed || 'Loading Failed', 
                  translations[currentLanguage]?.loadMoreFailed || 'Failed to load more professions, please refresh');
        professionLoader.classList.remove('active');
        setIsLoading(false);
    }
}

// Submit rating
async function submitRating(professionId, score) {
    try {
        // Generate a unique device identifier to prevent multiple votes
        const deviceId = getOrCreateDeviceId();
        
        // Check if this device has already voted for this profession
        const { data: existingVote, error: checkError } = await supabase
            .from('ratings')
            .select('id')
            .eq('profession_id', professionId)
            .eq('device_id', deviceId)
            .limit(1);
            
        if (checkError) throw checkError;
        
        // If user already voted, show message and return
        if (existingVote && existingVote.length > 0) {
            showMessage('rating-message', translations[currentLanguage]?.alreadyVoted || 'You have already voted for this profession', 'warning');
            return false;
        }
        
        logger.db('Insert', `Submitting rating: ${score} for profession ${professionId}`);
        
        // Convert 0-100 score to 1-5 rating (as integer)
        const starRating = Math.min(5, Math.max(1, Math.round(1 + (score / 100) * 4)));
        
        // Insert new rating
        const { error } = await supabase
            .from('ratings')
            .insert([
                { 
                    profession_id: professionId, 
                    score: starRating,
                    device_id: deviceId,
                    user_id: deviceId // Adding user_id field which is required by the database
                }
            ]);

        if (error) throw error;
        
        logger.db('Success', `Rating submitted successfully: ${starRating} stars`);
        
        // Update profession statistics in the database and get the updated stats
        const stats = await updateProfessionStats(professionId);
        
        // Update UI
        showMessage('rating-message', translations[currentLanguage]?.ratingSuccess || 'Rating submitted successfully!', 'success');
        
        // Force immediate UI update instead of waiting for realtime
        setTimeout(async () => {
            // Force reload of all professions to ensure synchronized data
            await loadPopularProfessions();
            
            // Then update the profession details modal
            showProfessionDetails(professionId);
            
            // Also refresh dashboard stats
            await loadDashboardStats();
        }, 500);
        
        return true;
    } catch (error) {
        logger.error('Failed to submit rating', error);
        showMessage('rating-message', translations[currentLanguage]?.ratingError || 'Error submitting rating. Please try again.', 'error');
        return false;
    }
}

// Submit comment
async function submitComment(content) {
    try {
        // Generate unique user ID for anonymous comments
        const deviceId = getOrCreateDeviceId();
        const anonymousName = `User_${deviceId.substring(0, 8)}`;
        
        logger.db('Insert', 'Submitting new comment');
        
        const {error} = await supabase
            .from('messages')
            .insert([
                { 
                    profession_id: currentProfessionId, 
                    content: content,
                    user_id: deviceId,
                    username: anonymousName
                }
            ]);

        if (error) throw error;

        logger.db('Success', 'Comment submitted successfully');
        
        // Update profession statistics in the database and get the updated stats
        const stats = await updateProfessionStats(currentProfessionId);
        
        showToast('success', translations[currentLanguage]?.commentSuccess || 'Comment Submitted', 
                  translations[currentLanguage]?.commentSaved || 'Your comment has been saved');
        
        // Force immediate UI update instead of waiting for realtime
        setTimeout(async () => {
            // Force reload of popular professions to ensure UI is updated
            await loadPopularProfessions();
            
            // Then refresh the profession details
            showProfessionDetails(currentProfessionId);
            
            // Also refresh scrolling comments
            loadScrollingComments();
        }, 500);
        
        return true;
    } catch (error) {
        logger.error('Failed to submit comment', error);
        showToast('error', translations[currentLanguage]?.commentError || 'Error', 
                  translations[currentLanguage]?.commentFailed || 'Could not save your comment. Please try again.');
        return false;
    }
}

// Function to update profession statistics in the database
async function updateProfessionStats(professionId) {
    try {
        logger.db('Query', `Updating statistics for profession ID: ${professionId}`);
        
        // Get count and average of ratings for this profession
        const { data: ratingsData, error: ratingsError } = await supabase
            .from('ratings')
            .select('score')
            .eq('profession_id', professionId);
            
        if (ratingsError) throw ratingsError;
        
        // Calculate average rating and total ratings
        const totalRatings = ratingsData ? ratingsData.length : 0;
        let avgRating = 0;
        
        if (totalRatings > 0) {
            const sum = ratingsData.reduce((acc, curr) => acc + curr.score, 0);
            avgRating = sum / totalRatings;
        }
        
        // Get count of comments for this profession
        const { count: commentsCount, error: commentsError } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('profession_id', professionId);
            
        if (commentsError) throw commentsError;
        
        logger.db('Info', `Calculated stats: Avg Rating = ${avgRating.toFixed(1)}, Total Ratings = ${totalRatings}, Comments = ${commentsCount || 0}`);
        
        // Update the profession record with new statistics
        const { error: updateError } = await supabase
            .from('professions')
            .update({
                avg_rating: avgRating,
                total_ratings: totalRatings,
                comments_count: commentsCount || 0
            })
            .eq('id', professionId);
            
        if (updateError) throw updateError;
        
        logger.db('Success', `Updated statistics for profession ID: ${professionId}`);
        return { avgRating, totalRatings, commentsCount: commentsCount || 0 };
    } catch (error) {
        logger.error(`Failed to update statistics for profession ID: ${professionId}`, error);
        return null;
    }
}

// New function to refresh a specific profession card with latest data
async function refreshProfessionCard(professionId) {
    try {
        logger.db('Query', `Refreshing data for profession ID: ${professionId}`);
        
        // Get updated profession data
        const { data: profession, error } = await supabase
            .from('professions')
            .select('*')
            .eq('id', professionId)
            .single();
            
        if (error) throw error;
        
        logger.db('Success', `Retrieved updated data for profession: ${profession.name}`);
        
        // Find all cards for this profession in the DOM and update them
        const cards = document.querySelectorAll(`.profession-card[data-id="${professionId}"]`);
        
        if (cards.length > 0) {
            cards.forEach(card => {
                // Update the rating stars
                const starsElement = card.querySelector('.stars');
                if (starsElement) {
                    starsElement.innerHTML = getStarsHTML(profession.avg_rating);
                }
                
                // Update the rating value
                const valueElement = card.querySelector('.value');
                if (valueElement) {
                    valueElement.textContent = profession.avg_rating ? profession.avg_rating.toFixed(1) : '0.0';
                }
                
                // Update the stats (ratings count and comments count)
                const statsElement = card.querySelector('.stats');
                if (statsElement) {
                    const spans = statsElement.querySelectorAll('span');
                    if (spans.length >= 2) {
                        spans[0].textContent = `${profession.total_ratings || 0} ${translations[currentLanguage]?.ratings || ''}`;
                        spans[1].textContent = `${profession.comments_count || 0} ${translations[currentLanguage]?.comments || ''}`;
                    }
                }
            });
            
            logger.success(`Updated ${cards.length} card(s) for profession ID: ${professionId}`);
        } else {
            logger.info(`No cards found for profession ID: ${professionId} - may need to reload list`);
            // If no cards found, we might need to reload the entire list
            await loadPopularProfessions();
        }
        
        return profession;
    } catch (error) {
        logger.error(`Failed to refresh profession card for ID: ${professionId}`, error);
        return null;
    }
}

// Generate or retrieve a unique device ID
function getOrCreateDeviceId() {
    // Try to get existing device ID from local storage
    let deviceId = localStorage.getItem('device_id');
    
    // If no device ID exists, create a new one
    if (!deviceId) {
        // Create a random ID based on timestamp and random number
        deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('device_id', deviceId);
        logger.info('New device ID created');
    }
    
    return deviceId;
}

// Setup infinite scroll with Intersection Observer
function setupInfiniteScroll() {
    setProfessionObserver(new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMoreProfessions) {
            loadMoreProfessions();
        }
    }));

    // Observe loader element
    professionObserver.observe(professionLoader);
}

// Load activity feed
async function loadActivityFeed() {
    try {
        logger.db('Query', 'Getting latest ratings');
        // Get latest ratings
        const {data: ratingData, error: ratingError} = await supabase
            .from('ratings')
            .select(`
                id,
                score,
                created_at,
                professions (
                    name,
                    category
                )
            `)
            .order('created_at', {ascending: false})
            .limit(10);

        if (ratingError) throw ratingError;
        logger.db('Success', `Retrieved ${ratingData.length} rating activities`);

        logger.db('Query', 'Getting latest messages');
        // Get latest messages
        const {data: messageData, error: messageError} = await supabase
            .from('messages')
            .select('*')
            .order('created_at', {ascending: false})
            .limit(5);

        if (messageError) throw messageError;
        logger.db('Success', `Retrieved ${messageData.length} messages`);

        // Combine and sort
        const activities = [...ratingData.map(rating => ({
            type: 'rating', time: new Date(rating.created_at), data: rating
        })), ...messageData.map(message => ({
            type: 'message', time: new Date(message.created_at), data: message
        }))].sort((a, b) => b.time - a.time).slice(0, 10);

        activityFeedEl.innerHTML = '';

        if (activities.length === 0) {
            activityFeedEl.innerHTML = '<div class="loading">No activity yet</div>';
            return;
        }

        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';

            const time = formatTime(activity.time);

            if (activity.type === 'rating') {
                const rating = activity.data;
                item.innerHTML = `
                    <div>User rated <strong>${rating.professions.category} > ${rating.professions.name}</strong>: ${rating.score} points</div>
                    <div class="activity-time">${time}</div>
                `;
            } else {
                const message = activity.data;
                item.innerHTML = `
                    <div>New comment: "${message.content}"</div>
                    <div class="activity-time">${time}</div>
                `;
            }

            activityFeedEl.appendChild(item);
        });

        logger.success('Activity feed loaded successfully');
    } catch (error) {
        logger.error('Failed to load activity feed', error);
        activityFeedEl.innerHTML = '<div class="loading">Failed to load activity feed</div>';
    }
}

// Load scrolling comments for the banner
async function loadScrollingComments() {
    try {
        logger.db('Query', 'Getting comments for scrolling banner');
        // Get a larger set of messages for the scrolling banner and join with professions
        const {data: messageData, error: messageError} = await supabase
            .from('messages')
            .select(`
                *,
                professions:profession_id (
                    name
                )
            `)
            .order('created_at', {ascending: false})
            .limit(20);

        if (messageError) throw messageError;
        logger.db('Success', `Retrieved ${messageData.length} comments for scrolling banner`);

        const scrollingCommentsEl = document.getElementById('scrolling-comments');
        scrollingCommentsEl.innerHTML = '';

        // If we don't have any comments, show a message
        if (messageData.length === 0) {
            scrollingCommentsEl.innerHTML = `<div class="loading-banner">${translations[currentLanguage]?.noComments || 'No comments yet'}</div>`;
            return;
        }

        // Process message comments
        messageData.forEach(message => {
            const comment = document.createElement('div');
            comment.className = 'comment-bubble';
            
            // Format as [Profession Name]: Message content
            const professionName = message.professions ? message.professions.name : translations[currentLanguage]?.general || 'General';
            
            comment.innerHTML = `
                <span class="profession-badge">[${professionName}]:</span>
                <span class="content">${message.content}</span>
            `;
            scrollingCommentsEl.appendChild(comment);
        });

        // Clone a few comments to ensure we have enough for continuous scrolling
        const commentBubbles = document.querySelectorAll('.comment-bubble');
        if (commentBubbles.length < 30) {
            commentBubbles.forEach(bubble => {
                const clone = bubble.cloneNode(true);
                scrollingCommentsEl.appendChild(clone);
            });
        }

        logger.success('Scrolling comments loaded successfully');
    } catch (error) {
        logger.error('Failed to load scrolling comments', error);
        const scrollingCommentsEl = document.getElementById('scrolling-comments');
        scrollingCommentsEl.innerHTML = '<div class="loading-banner">Failed to load comments</div>';
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        logger.db('Query', 'Getting total votes count');
        // Get total votes count
        const {count: totalVotes, error: votesError} = await supabase
            .from('ratings')
            .select('*', {count: 'exact'});

        if (votesError) throw votesError;
        logger.db('Success', `Total votes: ${totalVotes || 0}`);

        logger.db('Query', 'Getting average rating');
        // Get average rating
        const {data: avgData, error: avgError} = await supabase
            .from('professions')
            .select('avg_rating');

        if (avgError) throw avgError;
        logger.db('Success', `Retrieved ${avgData ? avgData.length : 0} rating records`);

        // Calculate overall average
        let overallAvg = 0;
        if (avgData && avgData.length > 0) {
            const sum = avgData.reduce((acc, curr) => acc + (curr.avg_rating || 0), 0);
            overallAvg = sum / avgData.length;
        }

        logger.db('Query', 'Getting profession count');
        // Get profession count
        const {count: profCount, error: profError} = await supabase
            .from('professions')
            .select('*', {count: 'exact'});

        if (profError) throw profError;
        logger.db('Success', `Profession count: ${profCount}`);

        // Update UI with animation
        animateCounter(totalVotesEl, 0, totalVotes || 0);
        animateCounter(avgPerceptionEl, 0, overallAvg, 2, true);
        animateCounter(professionCountEl, 0, profCount || 0);

        logger.success('Dashboard statistics loaded successfully');
    } catch (error) {
        logger.error('Failed to load dashboard statistics', error);
        showToast('error', 'Data loading failed', 'Failed to load statistics, please refresh');
    }
}

// Setup add profession modal event listeners
function setupAddProfessionModal() {
    document.getElementById('add-profession-button').addEventListener('click', showAddProfessionModal);
    document.getElementById('add-profession-form').addEventListener('submit', handleAddProfession);
    
    // Add event listener to close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => button.addEventListener('click', closeModals));
}

// Show the add profession modal
function showAddProfessionModal() {
    populateCategoryDropdown();
    updateFormPlaceholders();
    document.getElementById('add-profession-modal').style.display = 'flex';
}

// Populate category dropdown with translated options
function populateCategoryDropdown() {
    const dropdown = document.getElementById('profession-category');
    // Clear existing options except the first placeholder option
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Get the categories for the current language
    const langCategories = categories[currentLanguage] || categories.en;
    
    // Add options for each category
    for (const [value, text] of Object.entries(langCategories)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        dropdown.appendChild(option);
    }
}

// Update form placeholders based on current language
function updateFormPlaceholders() {
    const nameInput = document.getElementById('profession-name');
    const descInput = document.getElementById('profession-description');
    
    // Set placeholders from translations
    nameInput.placeholder = translations[currentLanguage]?.professionNamePlaceholder || 'Enter profession name';
    descInput.placeholder = translations[currentLanguage]?.professionDescriptionPlaceholder || 'Briefly describe this profession (optional)';
}

// Handle add profession
async function handleAddProfession(e) {
    e.preventDefault();

    const category = document.getElementById('profession-category').value;
    const name = document.getElementById('profession-name').value;
    const description = document.getElementById('profession-description').value;

    if (!category || !name) {
        showError(translations[currentLanguage]?.formError || 'Please fill in the profession category and name');
        return;
    }

    try {
        logger.info(`Adding new profession: Category=${category}, Name=${name}`);
        logger.db('Insert', `Adding new profession: ${category} > ${name}`);

        const {error} = await supabase
            .from('professions')
            .insert({
                category: category, name: name, description: description, total_ratings: 0, avg_rating: 0
            });

        if (error) throw error;

        logger.db('Success', 'Profession added successfully');
        // Show success message
        showToast('success', 
            translations[currentLanguage]?.addSuccess || 'Success', 
            translations[currentLanguage]?.professionAdded || 'Profession added successfully!'
        );

        // Close modal
        closeModals();

        // Refresh displays
        loadPopularProfessions();
        loadCategoryChart();

        // Clear form
        document.getElementById('profession-category').value = '';
        document.getElementById('profession-name').value = '';
        document.getElementById('profession-description').value = '';
    } catch (error) {
        logger.error('Failed to add profession', error);
        showError(translations[currentLanguage]?.addError || 'Failed to add profession, please try again');
    }
}

// Export all the required functions
export {
    loadPopularProfessions,
    loadMoreProfessions,
    showProfessionDetails,
    submitRating,
    submitComment,
    loadDashboardStats,
    setupInfiniteScroll,
    loadActivityFeed,
    loadScrollingComments,
    handleAddProfession,
    setupAddProfessionModal,
    showAddProfessionModal,
    populateCategoryDropdown,
    updateFormPlaceholders,
    getOrCreateDeviceId,
    refreshProfessionCard,
    updateProfessionStats
};