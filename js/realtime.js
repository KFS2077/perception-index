import logger from './logger.js';
import { 
    supabase, 
    realtimeSubscription, 
    currentProfessionId,
    setRealtimeSubscription 
} from './config.js';
import { loadDashboardStats, loadActivityFeed, loadPopularProfessions, showProfessionDetails } from './professions.js';
import { loadPerceptionChart, loadCategoryChart } from './charts.js';

// Array to store all subscriptions
let subscriptions = [];

// Subscribe to realtime updates
function subscribeToRealtimeUpdates() {
    // Unsubscribe from existing subscriptions if any
    cleanupSubscriptions();
    
    try {
        logger.info('正在订阅 ratings 表的实时更新');
        // Subscribe to ratings table changes
        const ratingsSubscription = supabase
            .channel('public:ratings')
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'ratings'
            }, payload => {
                logger.db('实时更新', `收到新评分: ${payload.new.score}分`);
                // Update dashboard stats
                loadDashboardStats();

                // Refresh activity feed
                loadActivityFeed();

                // Update charts
                loadPerceptionChart();

                // Update profession details if currently viewing
                if (currentProfessionId && payload.new.profession_id === currentProfessionId) {
                    showProfessionDetails(currentProfessionId);
                }
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    logger.success('成功订阅 ratings 表');
                } else if (status === 'CHANNEL_ERROR') {
                    logger.error('订阅 ratings 表失败', {status});
                }
            });
        
        subscriptions.push(ratingsSubscription);

        logger.info('正在订阅 messages 表的实时更新');
        // Subscribe to messages table changes
        const messagesSubscription = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages'
            }, payload => {
                logger.db('实时更新', `收到新消息: ${payload.new.content}`);
                
                // Refresh activity feed
                loadActivityFeed();
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    logger.success('成功订阅 messages 表');
                } else if (status === 'CHANNEL_ERROR') {
                    logger.error('订阅 messages 表失败', {status});
                }
            });
        
        subscriptions.push(messagesSubscription);

        logger.info('正在订阅 professions 表的实时更新');
        // Subscribe to professions table changes
        const professionsSubscription = supabase
            .channel('public:professions')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'professions'
            }, payload => {
                logger.db('实时更新', `职业表变更: ${payload.eventType}`);
                
                // Refresh dashboard stats
                loadDashboardStats();
                
                // Refresh popular professions
                loadPopularProfessions();
                
                // Update category chart
                loadCategoryChart();
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    logger.success('成功订阅 professions 表');
                } else if (status === 'CHANNEL_ERROR') {
                    logger.error('订阅 professions 表失败', {status});
                }
            });
        
        subscriptions.push(professionsSubscription);
        
        // Store the main subscription reference for compatibility
        if (subscriptions.length > 0) {
            setRealtimeSubscription(subscriptions[0]);
        }

        logger.success('所有表的实时订阅已完成');
    } catch (error) {
        logger.error('订阅实时更新时发生错误', error);
        // Clean up any partial subscriptions if there was an error
        cleanupSubscriptions();
    }
}

// Clean up subscriptions to prevent memory leaks and message channel errors
function cleanupSubscriptions() {
    if (realtimeSubscription) {
        try {
            realtimeSubscription.unsubscribe();
            logger.info('取消已有的实时订阅');
        } catch (error) {
            // Ignore unsubscribe errors
        }
    }
    
    if (subscriptions.length > 0) {
        subscriptions.forEach(sub => {
            if (sub && typeof sub.unsubscribe === 'function') {
                try {
                    sub.unsubscribe();
                } catch (error) {
                    // Ignore unsubscribe errors
                }
            }
        });
        subscriptions = [];
    }
}

// Setup clean up on page unload
window.addEventListener('beforeunload', () => {
    cleanupSubscriptions();
});

export { subscribeToRealtimeUpdates, cleanupSubscriptions };