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


// 添加一个缓存对象，用于保存已加载的职业详情和评论
const professionsCache = new Map();
const commentsCache = new Map();

// 生成骨架屏HTML，替代加载动画
function getSkeletonHTML() {
    return `
        <div class="profession-header skeleton">
            <h2 class="profession-title skeleton-text"></h2>
            <span class="category-badge skeleton-badge"></span>
        </div>
        
        <div class="profession-description skeleton-text"></div>
        
        <div class="agi-awareness-section skeleton">
            <h3 class="skeleton-text"></h3>
            <p class="slider-instruction skeleton-text"></p>
            
            <div class="perception-slider-container skeleton">
                <div class="percentage-display skeleton-circle"></div>
                <div class="perception-slider-wrapper skeleton-bar"></div>
                <div class="perception-levels">
                    <div class="perception-level skeleton-text"></div>
                    <div class="perception-level skeleton-text"></div>
                    <div class="perception-level skeleton-text"></div>
                    <div class="perception-level skeleton-text"></div>
                </div>
            </div>
        </div>
        
        <div class="profession-comments skeleton">
            <h3 class="skeleton-text"></h3>
            <div class="comments-list">
                <div class="comment-item skeleton"></div>
                <div class="comment-item skeleton"></div>
                <div class="comment-item skeleton"></div>
            </div>
        </div>
    `;
}


// Load popular professions
async function loadPopularProfessions() {
    try {
        logger.db('Query', 'Fetching popular professions (ordered by rating count)');
        
        // 重置分页状态
        setCurrentPage(1);
        setIsLoading(false);
        setHasMoreProfessions(true);
        
        // 修改为只获取8个职业（第9个将是"More..."按钮）
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

        // 添加前8个职业卡片
        data.forEach((profession, index) => {
            const card = createProfessionCard(profession);
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());
            popularListEl.appendChild(card);
        });
        
        // 添加"More..."按钮作为第9个卡片
        const moreCard = document.createElement('div');
        moreCard.className = 'profession-card more-card';
        moreCard.setAttribute('data-aos', 'fade-up');
        moreCard.setAttribute('data-aos-delay', (8 * 100).toString());
        moreCard.innerHTML = `
            <div class="card-header">
                <h3>${translations[currentLanguage]?.more || 'More...'}</h3>
            </div>
            <div class="card-body">
                <div class="more-icon">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `;
        
        // 点击"More..."按钮显示更多职业
        moreCard.addEventListener('click', showAllProfessions);
        moreCard.style.cursor = 'pointer';
        popularListEl.appendChild(moreCard);
        
        // 移除无限滚动监听器
        if (professionObserver) {
            professionObserver.disconnect();
            setProfessionObserver(null);
        }
        
        // 隐藏加载指示器
        professionLoader.style.display = 'none';

        logger.success('Popular professions loaded successfully');
    } catch (error) {
        logger.error('Failed to load popular professions', error);
        popularListEl.innerHTML = `<div class="loading">${translations[currentLanguage]?.loadFailed || 'Loading failed, please refresh'}</div>`;
    }
}

// 添加显示所有职业的函数
async function showAllProfessions() {
    try {
        // 显示加载指示器
        popularListEl.innerHTML = `<div class="loading">${translations[currentLanguage]?.loading || 'Loading...'}</div>`;
        
        const {data, error} = await supabase
            .from('professions')
            .select('*')
            .order('total_ratings', {ascending: false});

        if (error) throw error;
        
        popularListEl.innerHTML = '';
        
        // 创建返回按钮
        const backButton = document.createElement('div');
        backButton.className = 'back-button';
        backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${translations[currentLanguage]?.back || 'Back'}`;
        backButton.addEventListener('click', loadPopularProfessions);
        backButton.style.cursor = 'pointer';
        popularListEl.appendChild(backButton);
        
        // 添加所有职业卡片
        data.forEach((profession, index) => {
            const card = createProfessionCard(profession);
            popularListEl.appendChild(card);
        });
        
    } catch (error) {
        logger.error('Failed to load all professions', error);
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

// 优化后的showProfessionDetails函数
async function showProfessionDetails(professionId) {
    try {
        setCurrentProfessionId(professionId);
        logger.info(`Viewing profession details: ID=${professionId}`);
        
        // 立即显示模态框并使用骨架屏提升感知速度
        professionModal.style.display = 'flex';
        professionDetails.innerHTML = getSkeletonHTML();
        
        // 检查缓存中是否已有数据
        let profession = professionsCache.get(professionId);
        let messages = commentsCache.get(professionId);
        let hasVoted = false;
        
        // 并行请求数据以减少等待时间
        const fetchTasks = [];
        
        // 如果没有缓存的职业数据，则添加到请求任务中
        if (!profession) {
            fetchTasks.push(
                supabase.from('professions')
                .select('*')
                .eq('id', professionId)
                .single()
                .then(({ data, error }) => {
                    if (error) throw error;
                    profession = data;
                    professionsCache.set(professionId, data);
                    logger.db('Success', `Profession details fetched and cached: ${data.category} > ${data.name}`);
                })
            );
        } else {
            logger.db('Cache', `Using cached profession data for ID=${professionId}`);
        }
        
        // 如果没有缓存的评论数据，则添加到请求任务中
        if (!messages) {
            fetchTasks.push(
                supabase.from('messages')
                .select('*')
                .eq('profession_id', professionId)
                .order('created_at', {ascending: false})
                .limit(10)
                .then(({ data, error }) => {
                    if (error) throw error;
                    messages = data;
                    commentsCache.set(professionId, data);
                    logger.db('Success', `Retrieved and cached ${data.length} comments`);
                })
            );
        } else {
            logger.db('Cache', `Using cached comments data for profession ID=${professionId}`);
        }
        
        // 检查用户是否已经投票
        const deviceId = getOrCreateDeviceId();
        fetchTasks.push(
            supabase.from('ratings')
            .select('id')
            .eq('profession_id', professionId)
            .eq('device_id', deviceId)
            .limit(1)
            .then(({ data, error }) => {
                if (error) throw error;
                hasVoted = data && data.length > 0;
            })
        );
        
        // 并行执行所有数据请求
        await Promise.all(fetchTasks);
        
        // 更新UI前先检查数据是否完整，避免显示不完整的信息
        if (!profession) {
            throw new Error('Failed to load profession data');
        }
        
        // 转换评分为百分比显示
        const percentageValue = profession.avg_rating ? Math.round((profession.avg_rating - 1) / 4 * 100) : 50;
        
        // 创建详情HTML
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
            </div>
            
            <div class="profession-interactions">
                <div class="rating-section">
                    <div class="current-rating">
                        <div class="rating-label">${translations[currentLanguage]?.currentRating || ''}</div>
                        <div class="rating-stars">${getStarsHTML(profession.avg_rating)}</div>
                        <div class="rating-value">${profession.avg_rating ? profession.avg_rating.toFixed(1) : '0.0'}</div>
                    </div>
                    <div class="rating-participants">
                        <span>${translations[currentLanguage]?.ratingParticipants || ''}</span>
                        <span class="participants-count">${profession.total_ratings || 0}</span>
                    </div>
                </div>
                
                <button class="submit-rating-btn ${hasVoted ? 'disabled' : ''}" id="submit-rating-btn" ${hasVoted ? 'disabled' : ''}>
                    ${hasVoted ? translations[currentLanguage]?.alreadyVoted || '' : translations[currentLanguage]?.submitRating || ''}
                </button>
            </div>
            
            <div class="profession-comments">
                <h3>${translations[currentLanguage]?.commentsBoard || ''}</h3>
                <div class="comments-list" id="comments-list">
                    ${messages && messages.length > 0 ? 
                        messages.map(message => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <span class="comment-time">${formatTime(message.created_at)}</span>
                                </div>
                                <div class="comment-content">${message.content}</div>
                            </div>
                        `).join('') : 
                        `<div class="no-comments">${translations[currentLanguage]?.noComments || ''}</div>`
                    }
                </div>
                
                <div class="comment-form">
                    <textarea id="comment-input" class="comment-input" placeholder="${translations[currentLanguage]?.shareYourThoughts || ''}"></textarea>
                    <button id="send-comment-btn" class="send-comment-btn">
                        <i class="fas fa-paper-plane"></i> ${translations[currentLanguage]?.sendComment || ''}
                    </button>
                </div>
            </div>
        `;
        
        // 滑块交互初始化
        initializeSlider(hasVoted, percentageValue);
        
        // 初始化评分提交按钮
        const submitRatingBtn = document.getElementById('submit-rating-btn');
        if (submitRatingBtn && !hasVoted) {
            // 清除可能的旧事件监听器
            submitRatingBtn.replaceWith(submitRatingBtn.cloneNode(true));
            
            // 获取新的引用并添加事件监听器
            const newSubmitRatingBtn = document.getElementById('submit-rating-btn');
            newSubmitRatingBtn.addEventListener('click', () => {
                const slider = document.getElementById('agi-perception-slider');
                if (slider) {
                    const value = parseInt(slider.value);
                    submitRating(professionId, value);
                }
            });
        }
        
        // 初始化评论提交功能
        const sendCommentBtn = document.getElementById('send-comment-btn');
        const commentInput = document.getElementById('comment-input');
        
        if (sendCommentBtn && commentInput) {
            sendCommentBtn.addEventListener('click', () => {
                const content = commentInput.value.trim();
                if (content) {
                    submitComment(professionId, content);
                    commentInput.value = '';
                }
            });
            
            // 回车提交评论
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendCommentBtn.click();
                }
            });
        }
        
        // 显示关闭按钮
        const closeBtn = professionModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                professionModal.style.display = 'none';
            });
        }
        
        // 记录加载完成时间，用于性能分析
        logger.perf(`Profession details loaded in ${performance.now() - window.startTime}ms`);
        
    } catch (error) {
        logger.error('Failed to load profession details', error);
        professionDetails.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${translations[currentLanguage]?.loadFailed || 'Loading failed, please refresh'}</p>
            </div>
        `;
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

// 优化评分提交函数，加入缓存更新
async function submitRating(professionId, score) {
    try {
        // 基于百分比值(0-100)转换为评分值(1-5)
        const ratingValue = 1 + (score / 100) * 4;
        
        logger.db('Query', `Submitting rating value=${ratingValue.toFixed(2)} (score=${score}) for profession ID=${professionId}`);
        
        // 禁用提交按钮，防止重复提交
        const submitButton = document.getElementById('submit-rating-btn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLanguage]?.submittingRating || ''}`;
        }
        
        // 获取或创建设备ID
        const deviceId = getOrCreateDeviceId();
        
        // 检查用户是否已经投票
        const { data: existingVote, error: checkError } = await supabase
            .from('ratings')
            .select('id')
            .eq('profession_id', professionId)
            .eq('device_id', deviceId)
            .limit(1);
            
        if (checkError) throw checkError;
        
        if (existingVote && existingVote.length > 0) {
            showToast('warning', 
                    '', 
                    translations[currentLanguage]?.alreadyVoted || 'You have already voted for this profession');
            
            // 重置提交按钮
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = translations[currentLanguage]?.alreadyVoted || '';
                submitButton.classList.add('disabled');
            }
            
            return;
        }
        
        // 添加评分到数据库
        const { data, error } = await supabase
            .from('ratings')
            .insert([
                { 
                    profession_id: professionId,
                    score: ratingValue, // 使用转换后的评分值(1-5)，而不是原始slider值
                    device_id: deviceId,
                    user_id: deviceId // 添加user_id字段，使用deviceId作为值
                }
            ]);
            
        if (error) throw error;
        
        logger.db('Success', `Rating submitted: ${ratingValue.toFixed(2)}, slider score: ${score}`);
        
        // 更新缓存中的职业数据
        const profession = professionsCache.get(professionId);
        if (profession) {
            // 获取更新后的职业数据
            const { data: updatedProfession, error: fetchError } = await supabase
                .from('professions')
                .select('*')
                .eq('id', professionId)
                .single();
                
            if (fetchError) throw fetchError;
            
            // 更新缓存
            professionsCache.set(professionId, updatedProfession);
            
            // 更新UI显示的评分
            const percentageValue = updatedProfession.avg_rating ? Math.round((updatedProfession.avg_rating - 1) / 4 * 100) : 50;
            const percentageDisplay = document.querySelector('.percentage-value');
            if (percentageDisplay) {
                percentageDisplay.textContent = `${percentageValue}%`;
            }
            
            // 更新星级评分显示
            const ratingStars = document.querySelector('.rating-stars');
            if (ratingStars) {
                ratingStars.innerHTML = getStarsHTML(updatedProfession.avg_rating);
            }
            
            const ratingValue = document.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = updatedProfession.avg_rating ? updatedProfession.avg_rating.toFixed(1) : '0.0';
            }
            
            // 更新参与人数
            const participantsCount = document.querySelector('.participants-count');
            if (participantsCount) {
                participantsCount.textContent = updatedProfession.total_ratings || 0;
            }
            
            // 禁用滑块
            const slider = document.getElementById('agi-perception-slider');
            if (slider) {
                slider.disabled = true;
                slider.value = percentageValue;
            }
            
            // 更新相应的职业卡片
            refreshProfessionCard(professionId);
        }
        
        // 更新提交按钮
        if (submitButton) {
            submitButton.innerHTML = translations[currentLanguage]?.alreadyVoted || '';
            submitButton.classList.add('disabled');
        }
        
        // 显示成功消息
        showToast('success', 
                translations[currentLanguage]?.ratingSuccess || 'Rating submitted successfully!',
                translations[currentLanguage]?.voteRegistered || 'Your vote has been registered');
        
        // 触发实时活动更新
        updateRealtimeActivity('rating', professionId);
        
    } catch (error) {
        logger.error('Failed to submit rating', error);
        showToast('error', 
                translations[currentLanguage]?.ratingError || 'Error submitting rating. Please try again.');
        
        // 重置提交按钮
        const submitButton = document.getElementById('submit-rating-btn');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = translations[currentLanguage]?.submitRating || 'Submit Rating';
        }
    }
}


// 优化评论提交函数，加入缓存更新
async function submitComment(professionId, content) {
    try {
        // 先检查输入
        if (!content || !content.trim()) {
            showMessage('warning', translations[currentLanguage]?.commentError || 'Error', 
                      translations[currentLanguage]?.commentEmpty || 'Comment cannot be empty');
            return;
        }
        
        logger.db('Query', `Submitting comment for profession ID=${professionId}`);
        
        // 获取设备ID，只用来生成user_id
        const deviceId = getOrCreateDeviceId();
        
        // 创建评论对象
        const comment = {
            profession_id: professionId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            username: "Anon", // 默认用户名
            user_id: deviceId // 使用deviceId作为user_id
        };
        
        // 显示提交中状态
        const commentsList = document.getElementById('comments-list');
        const commentForm = document.querySelector('.comment-form');
        
        if (commentForm) {
            commentForm.classList.add('submitting');
        }
        
        // 添加评论到数据库
        const { data, error } = await supabase
            .from('messages')
            .insert([comment]);
            
        if (error) throw error;
        
        logger.db('Success', 'Comment submitted successfully');
        
        // 提交成功后更新缓存
        if (commentsCache.has(professionId)) {
            const cachedComments = commentsCache.get(professionId);
            // 将新评论添加到缓存的开头（最新的在前面）
            commentsCache.set(professionId, [comment, ...cachedComments]);
        }
        
        // 更新UI
        if (commentsList) {
            // 检查是否为首条评论
            if (commentsList.querySelector('.no-comments')) {
                commentsList.innerHTML = '';
            }
            
            // 创建新评论元素
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item new-comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-time">${formatTime(comment.created_at)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            
            // 添加到列表顶部
            commentsList.insertBefore(commentElement, commentsList.firstChild);
            
            // 添加动画效果
            setTimeout(() => {
                commentElement.classList.add('show');
            }, 10);
        }
        
        // 更新评论计数
        const profession = professionsCache.get(professionId);
        if (profession) {
            profession.comments_count = (profession.comments_count || 0) + 1;
            // 更新缓存
            professionsCache.set(professionId, profession);
            // 更新相应的职业卡片
            refreshProfessionCard(professionId);
        }
        
        // 恢复表单状态
        if (commentForm) {
            commentForm.classList.remove('submitting');
        }
        
        // 显示成功消息
        showToast('success', 
                translations[currentLanguage]?.commentSuccess || 'Comment Submitted', 
                translations[currentLanguage]?.commentSaved || 'Your comment has been saved');
        
        // 触发实时活动更新
        updateRealtimeActivity('comment', professionId);
        
    } catch (error) {
        logger.error('Failed to submit comment', error);
        showToast('error', 
                translations[currentLanguage]?.commentError || 'Error', 
                translations[currentLanguage]?.commentFailed || 'Could not save your comment. Please try again.');
                
        // 恢复表单状态
        const commentForm = document.querySelector('.comment-form');
        if (commentForm) {
            commentForm.classList.remove('submitting');
        }
    }
}


// 优化职业卡片刷新函数，更新缓存的数据
async function refreshProfessionCard(professionId) {
    try {
        const profession = professionsCache.get(professionId);
        
        // 如果没有缓存数据，则重新获取
        if (!profession) {
            const { data, error } = await supabase
                .from('professions')
                .select('*')
                .eq('id', professionId)
                .single();
                
            if (error) throw error;
            professionsCache.set(professionId, data);
            
            updateCardUI(data);
        } else {
            // 直接使用缓存数据更新UI
            updateCardUI(profession);
        }
        
    } catch (error) {
        logger.error(`Failed to refresh profession card ID=${professionId}`, error);
    }
    
    // 更新卡片UI的内部函数
    function updateCardUI(profession) {
        const card = document.querySelector(`.profession-card[data-id="${professionId}"]`);
        if (!card) return;
        
        const stars = getStarsHTML(profession.avg_rating);
        
        // 获取正确的类别显示文本
        let displayCategory = profession.category;
        if (currentLanguage !== 'en') {
            const categoryKey = Object.keys(categories.en).find(
                key => categories.en[key].toLowerCase() === profession.category.toLowerCase()
            );
            
            if (categoryKey && categories[currentLanguage] && categories[currentLanguage][categoryKey]) {
                displayCategory = categories[currentLanguage][categoryKey];
            }
        }
        
        // 更新卡片内容
        card.innerHTML = `
            <div class="card-header">
                <h3>${profession.name}</h3>
                <span class="category-badge">${displayCategory}</span>
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
        
        // 重新添加点击事件监听器
        setTimeout(() => {
            card.addEventListener('click', function() {
                showProfessionDetails(profession.id);
            });
            card.style.cursor = 'pointer';
        }, 0);
        
        // 添加更新动画
        card.classList.add('card-updated');
        setTimeout(() => {
            card.classList.remove('card-updated');
        }, 1000);
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

// 优化滑块初始化函数
function initializeSlider(hasVoted, initialValue) {
    const slider = document.getElementById('agi-perception-slider');
    const percentageDisplay = document.querySelector('.percentage-value');
    const perceptionLevels = document.querySelectorAll('.perception-level');
    
    if (!slider) {
        logger.error('初始化滑块失败：无法找到滑块元素');
        return;
    }
    
    // 设置初始值
    slider.value = initialValue;
    
    // 更新百分比显示
    if (percentageDisplay) {
        percentageDisplay.textContent = `${initialValue}%`;
    }
    
    // 禁用已投票的滑块
    if (hasVoted) {
        slider.disabled = true;
        return;
    }
    
    // 滑块移动时更新UI
    slider.addEventListener('input', function() {
        const value = parseInt(this.value);
        
        // 更新百分比显示
        if (percentageDisplay) {
            percentageDisplay.textContent = `${value}%`;
        }
        
        // 更新活跃级别
        highlightCurrentLevel(value);
    });
    
    // 点击级别区域直接设置滑块值
    perceptionLevels.forEach(level => {
        level.addEventListener('click', function() {
            if (hasVoted) return;
            
            const range = this.dataset.range.split('-');
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);
            const value = Math.floor((min + max) / 2);
            
            slider.value = value;
            
            // 更新百分比显示
            if (percentageDisplay) {
                percentageDisplay.textContent = `${value}%`;
            }
            
            // 更新活跃级别
            highlightCurrentLevel(value);
        });
    });
    
    // 突出显示当前级别
    function highlightCurrentLevel(value) {
        perceptionLevels.forEach(level => {
            level.classList.remove('active');
            
            const range = level.dataset.range.split('-');
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);
            
            if (value >= min && value <= max) {
                level.classList.add('active');
            }
        });
    }
    
    // 初始化突出显示当前级别
    highlightCurrentLevel(initialValue);
    
    logger.info('滑块初始化完成');
}


// 优化更新实时活动函数
function updateRealtimeActivity(actionType, professionId) {
    // 如果有缓存的职业数据，直接使用
    const profession = professionsCache.get(professionId);
    if (!profession) return;
    
    // 创建活动数据
    const activity = {
        profession_id: professionId,
        profession_name: profession.name,
        profession_category: profession.category,
        action_type: actionType,
        timestamp: new Date().toISOString()
    };
    
    // 更新活动feed
    const activityFeed = document.getElementById('activity-feed');
    if (activityFeed) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item new-activity';
        
        // 根据活动类型设置不同的图标和文本
        let activityIcon, activityText;
        
        if (actionType === 'rating') {
            activityIcon = '<i class="fas fa-star activity-icon"></i>';
            activityText = translations[currentLanguage]?.activityRating || `A new rating was submitted for ${profession.name}`;
        } else if (actionType === 'comment') {
            activityIcon = '<i class="fas fa-comment activity-icon"></i>';
            activityText = translations[currentLanguage]?.activityComment || `A new comment was added to ${profession.name}`;
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon-wrapper">
                ${activityIcon}
            </div>
            <div class="activity-content">
                <p>${activityText}</p>
                <span class="activity-time">Just now</span>
            </div>
        `;
        
        // 添加到活动Feed顶部
        if (activityFeed.firstChild) {
            activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        } else {
            activityFeed.appendChild(activityItem);
        }
        
        // 添加动画效果
        setTimeout(() => {
            activityItem.classList.add('show');
        }, 10);
        
        // 如果活动项超过10个，移除最后一个
        const activityItems = activityFeed.querySelectorAll('.activity-item');
        if (activityItems.length > 10) {
            activityFeed.removeChild(activityItems[activityItems.length - 1]);
        }
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
};
