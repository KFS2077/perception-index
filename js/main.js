import logger from './logger.js';
import translations from './i18n.js';
import { 
    supabaseUrl, 
    supabaseKey, 
    supabase,
    initializeDOMElements,
    totalVotesEl,
    avgPerceptionEl,
    professionCountEl,
    searchInputEl,
    searchButtonEl,
    searchResultsEl,
    popularListEl,
    activityFeedEl,
    professionModal,
    professionDetails,
    addProfessionModal,
    addProfessionForm,
    loadingOverlay,
    professionLoader,
    backToTopBtn,
    themeToggleIcon,
    languageSelect,
    currentLanguage,
    setCurrentLanguage,
    initializeSupabase
} from './config.js';
import { toggleTheme, enableDarkMode, showToast, applyTranslations, closeModals, showAddProfessionModal,applyResponsiveLayout } from './ui.js';
import { setupCharts } from './charts.js';
import { handleSearchInput, handleSearch } from './search.js';
import { 
    loadDashboardStats, 
    loadPopularProfessions, 
    loadActivityFeed, 
    setupInfiniteScroll,
    handleAddProfession,
    loadScrollingComments,
    setupAddProfessionModal
} from './professions.js';
import { subscribeToRealtimeUpdates, cleanupSubscriptions } from './realtime.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    logger.info('Application initialization started');

    // Check if this is the first visit to redirect to landing page
    const hasVisitedBefore = sessionStorage.getItem('hasVisitedBefore');
    const preloadComplete = sessionStorage.getItem('preloadComplete');
    
    if (!hasVisitedBefore && !window.location.href.includes('index.html')) {
        sessionStorage.setItem('hasVisitedBefore', 'true');
        window.location.href = 'index.html';
        return;
    }

    // Initialize DOM elements by passing them to config.js instead of reassigning
    initializeDOMElements({
        totalVotesEl: document.getElementById('total-votes'),
        avgPerceptionEl: document.getElementById('avg-perception'),
        professionCountEl: document.getElementById('profession-count'),
        searchInputEl: document.getElementById('search-input'),
        searchButtonEl: document.getElementById('search-button'),
        searchResultsEl: document.getElementById('search-results'),
        popularListEl: document.getElementById('popular-list'),
        activityFeedEl: document.getElementById('activity-feed'),
        professionModal: document.getElementById('profession-modal'),
        professionDetails: document.getElementById('profession-details'),
        addProfessionModal: document.getElementById('add-profession-modal'),
        addProfessionForm: document.getElementById('add-profession-form'),
        loadingOverlay: document.getElementById('loading-overlay'),
        professionLoader: document.getElementById('profession-loader'),
        backToTopBtn: document.getElementById('back-to-top'),
        themeToggleIcon: document.getElementById('theme-toggle-icon'),
        languageSelect: document.getElementById('language-select')
    });

    // Initialize AOS animations
    AOS.init({
        duration: 800,
        once: false,
        mirror: true
    });

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        enableDarkMode();
    }

    // Initialize language selector
    if (localStorage.getItem('language')) {
        setCurrentLanguage(localStorage.getItem('language'));
        languageSelect.value = currentLanguage;
    } else {
        languageSelect.value = 'en';
    }
    
    // Apply translations based on selected language
    applyTranslations();
    // 应用响应式布局
    applyResponsiveLayout();
    window.addEventListener('resize', applyResponsiveLayout);

    try {
        // Hide loading overlay if came from landing page
        if (preloadComplete) {
            logger.info('Content was preloaded on landing page, hiding loading overlay');
            // Hide loading overlay immediately with a subtle fade
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 200);
            
            // Initialize Supabase - we still need to do this
            logger.info('Initializing Supabase client...');
            initializeSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
            
            // Setup the application but with an already loaded UI
            await setupApplication(true);
        } else {
            // Standard initialization (direct access without landing page)
            logger.info('Standard initialization (no preload detected)');
            
            // Initialize Supabase
            logger.info('Initializing Supabase client...');
            initializeSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
            
            // Setup application with visible loading indicators
            await setupApplication(false);
        }
    } catch (error) {
        logger.error('初始化失败', error);
        loadingOverlay.style.display = 'none';
        showToast('error', '初始化失败', '应用程序启动时出现错误，请刷新页面重试');
    }
});

// Setup application
async function setupApplication(preloadedUI = false) {
    try {
        // Setup charts
        logger.info('Setting up charts...');
        setupCharts();
        
        // If UI was preloaded, we can load data in background
        // otherwise show loading indicators
        if (!preloadedUI) {
            loadingOverlay.style.display = 'flex';
        }
        
        // Load data for each section
        await loadDashboardStats();
        await loadPopularProfessions();
        loadActivityFeed();
        loadScrollingComments();
        setupCharts();
        
        // Setup event listeners 
        setupEventListeners();
        
        // Setup add profession modal
        setupAddProfessionModal();
        
        // Initialize search
        handleSearchInput();
        
        // Subscribe to realtime updates
        subscribeToRealtimeUpdates();
        
        // Hide loading overlay with animation if not already hidden
        if (!preloadedUI) {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }, 200);
        }
        
        logger.success('应用初始化成功');
    } catch (error) {
        logger.error('应用初始化失败', error);
        loadingOverlay.style.display = 'none';
        showToast('error', '加载失败', '加载数据时出现错误，请刷新页面重试');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Language selector
    languageSelect.addEventListener('change', (event) => {
        setCurrentLanguage(event.target.value);
        localStorage.setItem('language', currentLanguage);
        applyTranslations();
        
        // Refresh the UI components to update translations
        loadScrollingComments();
        loadPopularProfessions();
        loadActivityFeed();
    });

    // Search functionality
    searchInputEl.addEventListener('input', handleSearchInput);
    searchButtonEl.addEventListener('click', handleSearch);

    // Add Profession button
    const addProfessionButton = document.getElementById('add-profession-button');
    if (addProfessionButton) {
        addProfessionButton.addEventListener('click', showAddProfessionModal);
    }

    // Close modals when clicking the X or outside the modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModals);
    });

    window.addEventListener('click', (event) => {
        if (event.target === professionModal) {
            closeModals();
        }
        if (event.target === addProfessionModal) {
            closeModals();
        }
    });

    // Add profession form submission
    addProfessionForm.addEventListener('submit', handleAddProfession);

    // Scroll event for navbar and back to top button
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTopBtn.classList.add('active');
        } else {
            navbar.classList.remove('scrolled');
            backToTopBtn.classList.remove('active');
        }
    });

    // Back to top button
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Theme toggle
    themeToggleIcon.addEventListener('click', toggleTheme);

    // Toast close buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('toast-close')) {
            const toast = e.target.closest('.toast');
            removeToast(toast);
        }
    });

    // Document click handler for closing search results
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container') && !event.target.closest('.search-results')) {
            searchResultsEl.classList.remove('active');
        }
    });

    logger.info('事件监听器设置完成');
}

// 添加网页加载完成的日志
window.addEventListener('load', () => {
    logger.info('页面完全加载完成');
    logger.info(`用户代理: ${navigator.userAgent}`);
    logger.info(`屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`);
});

// 监听网络状态变化
window.addEventListener('online', () => {
    logger.info('网络连接已恢复');
    showMessage('网络连接已恢复');
});

window.addEventListener('offline', () => {
    logger.warning('网络连接已断开');
    showError('网络连接已断开，部分功能可能不可用');
});

// Clean up subscriptions on unload
window.addEventListener('unload', () => {
    cleanupSubscriptions();
});

export { setupEventListeners };