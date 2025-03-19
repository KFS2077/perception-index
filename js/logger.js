// Logger system
const logger = {
    info: (message) => {
        // console.log(`%c[INFO] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #4361ee');
    },
    success: (message) => {
        // console.log(`%c[SUCCESS] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #38b000');
    },
    warning: (message) => {
        // console.log(`%c[WARNING] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #f48c06');
    },
    error: (message, error) => {
        // console.error(`%c[ERROR] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #d00000', error);
    },
    db: (operation, details) => {
        // console.log(`%c[DATABASE] ${new Date().toLocaleTimeString()} - ${operation}`, 'color: #3a0ca3', details);
    }
};

// 记录性能指标，添加到logger.js中
// 使用性能记录器跟踪函数执行时间
logger.perf = function(message) {
    // console.log(`%c⚡ ${message}`, 'color: #ff9800; font-weight: bold');
};

// 在main.js的适当位置添加性能标记
window.addEventListener('DOMContentLoaded', () => {
    window.startTime = performance.now();
    // 记录导航时间
    logger.perf(`Navigation: ${performance.timing.navigationStart}`);
    logger.perf(`DOMContentLoaded: ${performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart}ms`);
});

// 存储PerformanceObserver实例以便可以在页面卸载时断开连接
let perfObserver = null;

window.addEventListener('load', () => {
    // 记录页面完全加载时间
    logger.perf(`Page load complete: ${performance.now() - window.startTime}ms`);
    
    // 监控网络请求
    if (window.PerformanceObserver) {
        try {
            perfObserver = new PerformanceObserver((entries) => {
                entries.getEntries().forEach(entry => {
                    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                        logger.perf(`API request (${entry.name}): ${entry.duration}ms`);
                    }
                });
            });
            
            perfObserver.observe({entryTypes: ['resource']});
        } catch (e) {
            // 忽略PerformanceObserver初始化错误
        }
    }
});

// 在页面卸载时断开PerformanceObserver以避免消息通道错误
window.addEventListener('beforeunload', () => {
    if (perfObserver) {
        try {
            perfObserver.disconnect();
            perfObserver = null;
        } catch (e) {
            // 忽略断开连接错误
        }
    }
});

export default logger;
