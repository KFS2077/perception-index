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
    currentLanguage
} from './config.js';
import { showToast, showError, showMessage, animateCounter } from './ui.js';
import { getStarsHTML, formatTime } from './utils.js';
import { loadCategoryChart } from './charts.js';
import translations from './i18n.js';

// Load popular professions
async function loadPopularProfessions() {
    try {
        logger.db('查询', '获取热门职业 (按评分数量排序)');
        const {data, error} = await supabase
            .from('professions')
            .select('*')
            .order('total_ratings', {ascending: false})
            .limit(8);

        if (error) throw error;
        logger.db('成功', `获取到 ${data.length} 个热门职业`);

        popularListEl.innerHTML = '';

        if (data.length === 0) {
            popularListEl.innerHTML = '<div class="loading">暂无数据</div>';
            return;
        }

        data.forEach((profession, index) => {
            const card = createProfessionCard(profession);
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());
            popularListEl.appendChild(card);
        });

        logger.success('热门职业加载完成');
    } catch (error) {
        logger.error('加载热门职业失败', error);
        popularListEl.innerHTML = '<div class="loading">加载失败，请刷新重试</div>';
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

    card.addEventListener('click', () => {
        showProfessionDetails(profession.id);
    });

    return card;
}

// Show profession details
async function showProfessionDetails(professionId) {
    try {
        setCurrentProfessionId(professionId);
        logger.info(`查看职业详情: ID=${professionId}`);

        logger.db('查询', `获取职业详情: ID=${professionId}`);
        // Get profession details
        const {data: profession, error: professionError} = await supabase
            .from('professions')
            .select('*')
            .eq('id', professionId)
            .single();

        if (professionError) throw professionError;
        logger.db('成功', `职业详情: ${profession.category} > ${profession.name}`);

        logger.db('查询', '获取最新留言');
        // Get comments for this profession
        const {data: messages, error: messagesError} = await supabase
            .from('messages')
            .select('*')
            .order('created_at', {ascending: false})
            .limit(10);

        if (messagesError) throw messagesError;
        logger.db('成功', `获取到 ${messages.length} 条留言`);

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
                        <input type="range" min="0" max="100" value="50" class="perception-slider" id="agi-perception-slider">
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
                    <button id="submit-perception" class="vote-button" disabled>${translations[currentLanguage]?.submitRating || ''}</button>
                    <div id="rating-message" class="rating-message"></div>
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
        if (messages.length > 0) {
            commentList.innerHTML = '';
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
            // Convert percentage (0-100) back to rating (1-5)
            const rating = Math.round((perceptionValue / 100 * 4) + 1);
            submitRating(professionId, rating);
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
        logger.success('职业详情加载完成');
    } catch (error) {
        logger.error('加载职业详情失败', error);
    }
}

// Submit rating
async function submitRating(professionId, score) {
    try {
        // Generate a random user ID if not available
        // In a real app, this would be the authenticated user's ID
        const userId = localStorage.getItem('user_id') || Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user_id', userId);

        logger.info(`提交评分: 职业ID=${professionId}, 分数=${score}%`);
        logger.db('插入/更新', `用户 ${userId} 对职业 ${professionId} 的评分: ${score}%`);

        const ratingMessage = document.getElementById('rating-message');
        const submitPerceptionBtn = document.getElementById('submit-perception');
        
        // Show loading message
        ratingMessage.textContent = translations[currentLanguage]?.submittingRating || 'Submitting your rating...';
        submitPerceptionBtn.disabled = true;

        // Submit rating - store the percentage directly
        const {error} = await supabase
            .from('ratings')
            .upsert({
                profession_id: professionId, user_id: userId, score: score
            }, {
                onConflict: 'profession_id,user_id'
            });

        if (error) throw error;

        logger.db('成功', '评分提交成功');
        
        // Show success message on the current page
        ratingMessage.textContent = translations[currentLanguage]?.ratingSuccess || 'Rating submitted successfully!';
        ratingMessage.classList.add('success-message');
        
        // Refresh the data after a short delay
        setTimeout(() => {
            loadPopularProfessions();
            loadStats();
            loadActivityFeed();
        }, 1000);
        
        // Do not close the modal
    } catch (error) {
        logger.error('提交评分失败', error);
        const ratingMessage = document.getElementById('rating-message');
        ratingMessage.textContent = translations[currentLanguage]?.ratingError || 'Failed to submit rating. Please try again.';
        ratingMessage.classList.add('error-message');
        document.getElementById('submit-perception').disabled = false;
    }
}

// Submit comment
async function submitComment(content) {
    try {
        // Generate a random user ID if not available
        const userId = localStorage.getItem('user_id') || Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user_id', userId);

        // Get username (could be from profile in a real app)
        const username = localStorage.getItem('username') || 'anon';

        logger.info(`提交留言: 用户=${username}, 内容长度=${content.length}`);
        logger.db('插入', `用户 ${userId} 发表留言`);

        // Submit message
        const {error} = await supabase
            .from('messages')
            .insert({
                content: content, user_id: userId, username: username
            });

        if (error) throw error;

        logger.db('成功', '留言提交成功');
        // Show success message
        showMessage('留言发送成功！');

        // Clear form
        document.getElementById('comment-input').value = '';

        // Update display via realtime subscription
    } catch (error) {
        logger.error('提交留言失败', error);
        showError('留言发送失败，请重试');
    }
}

// Handle add profession
async function handleAddProfession(e) {
    e.preventDefault();

    const category = document.getElementById('profession-category').value;
    const name = document.getElementById('profession-name').value;
    const description = document.getElementById('profession-description').value;

    if (!category || !name) {
        showError('请填写职业类别和名称');
        return;
    }

    try {
        logger.info(`添加新职业: 类别=${category}, 名称=${name}`);
        logger.db('插入', `添加新职业: ${category} > ${name}`);

        const {error} = await supabase
            .from('professions')
            .insert({
                category: category, name: name, description: description, total_ratings: 0, avg_rating: 0
            });

        if (error) throw error;

        logger.db('成功', '职业添加成功');
        // Show success message
        showMessage('职业添加成功！');

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
        logger.error('添加职业失败', error);
        showError('添加职业失败，请重试');
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
        const { data, error } = await supabase
            .from('professions')
            .select('*')
            .order('total_ratings', { ascending: false })
            .range(offset, offset + 7);

        if (error) throw error;

        if (data.length === 0) {
            setHasMoreProfessions(false);
            professionLoader.classList.remove('active');
            return;
        }

        // Add some delay to make the loading more visible
        setTimeout(() => {
            data.forEach(profession => {
                const card = createProfessionCard(profession);
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (data.indexOf(profession) * 100).toString());
                popularListEl.appendChild(card);
            });

            // Refresh AOS for new elements
            AOS.refresh();
            professionLoader.classList.remove('active');
            setIsLoading(false);
        }, 800);
    } catch (error) {
        logger.error('加载更多职业失败', error);
        showToast('error', '加载失败', '获取更多职业数据失败，请刷新页面重试');
        professionLoader.classList.remove('active');
        setIsLoading(false);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        logger.db('查询', '获取总投票数');
        // Get total votes count
        const {count: totalVotes, error: votesError} = await supabase
            .from('ratings')
            .select('*', {count: 'exact'});

        if (votesError) throw votesError;
        logger.db('成功', `总投票数: ${totalVotes || 0}`);

        logger.db('查询', '获取平均评分');
        // Get average rating
        const {data: avgData, error: avgError} = await supabase
            .from('professions')
            .select('avg_rating');

        if (avgError) throw avgError;
        logger.db('成功', `获取到 ${avgData ? avgData.length : 0} 条评分记录`);

        // Calculate overall average
        let overallAvg = 0;
        if (avgData && avgData.length > 0) {
            const sum = avgData.reduce((acc, curr) => acc + (curr.avg_rating || 0), 0);
            overallAvg = sum / avgData.length;
        }

        logger.db('查询', '获取职业总数');
        // Get profession count
        const {count: profCount, error: profError} = await supabase
            .from('professions')
            .select('*', {count: 'exact'});

        if (profError) throw profError;
        logger.db('成功', `职业总数: ${profCount}`);

        // Update UI with animation
        animateCounter(totalVotesEl, 0, totalVotes || 0);
        animateCounter(avgPerceptionEl, 0, overallAvg, 2, true);
        animateCounter(professionCountEl, 0, profCount || 0);

        logger.success('仪表盘统计数据加载完成');
    } catch (error) {
        logger.error('加载仪表盘统计数据失败', error);
        showToast('error', '数据加载失败', '获取统计数据失败，请刷新页面重试');
    }
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
        logger.db('查询', '获取最新评分活动');
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
        logger.db('成功', `获取到 ${ratingData.length} 条评分活动`);

        logger.db('查询', '获取最新留言');
        // Get latest messages
        const {data: messageData, error: messageError} = await supabase
            .from('messages')
            .select('*')
            .order('created_at', {ascending: false})
            .limit(5);

        if (messageError) throw messageError;
        logger.db('成功', `获取到 ${messageData.length} 条留言`);

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

        logger.success('活动信息加载完成');
    } catch (error) {
        logger.error('加载活动信息失败', error);
        activityFeedEl.innerHTML = '<div class="loading">Failed to load activity feed</div>';
    }
}

// Load scrolling comments for the banner
async function loadScrollingComments() {
    try {
        logger.db('查询', '获取评论数据用于滚动横幅');
        // Get a larger set of messages for the scrolling banner
        const {data: messageData, error: messageError} = await supabase
            .from('messages')
            .select('*')
            .order('created_at', {ascending: false})
            .limit(20);

        if (messageError) throw messageError;
        logger.db('成功', `获取到 ${messageData.length} 条滚动横幅评论`);

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
            comment.innerHTML = `
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

        logger.success('滚动评论横幅加载完成');
    } catch (error) {
        logger.error('加载滚动评论横幅失败', error);
        const scrollingCommentsEl = document.getElementById('scrolling-comments');
        scrollingCommentsEl.innerHTML = '<div class="loading-banner">Failed to load comments</div>';
    }
}

export { 
    loadPopularProfessions, 
    createProfessionCard, 
    showProfessionDetails, 
    submitRating,
    submitComment,
    handleAddProfession,
    loadMoreProfessions,
    loadDashboardStats,
    setupInfiniteScroll,
    loadActivityFeed,
    loadScrollingComments
};