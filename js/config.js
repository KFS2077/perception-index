// Supabase initialization
const supabaseUrl = 'https://durnkjmmxkdvppqwzzvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cm5ram1teGtkdnBwcXd6enZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDY1OTIsImV4cCI6MjA1NjgyMjU5Mn0.kmxfDabrS3X8pVDAaNZ0HZO0wOXakLitrnSaHnEsspI';

// Global variables
let supabase;
let currentProfessionId = null;
let realtimeSubscription = null;
let currentPage = 1;
let isLoading = false;
let hasMoreProfessions = true;
let isDarkMode = false;
let professionObserver;
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to set current language
function setCurrentLanguage(language) {
    currentLanguage = language;
}

// Function to initialize Supabase client
function initializeSupabase(client) {
    supabase = client;
}

// Function to initialize charts
function initializeCategoryChart(chart) {
    categoryChart = chart;
}

function initializePerceptionChart(chart) {
    perceptionChart = chart;
}

// Functions to set state variables
function setCurrentProfessionId(id) {
    currentProfessionId = id;
}

function setRealtimeSubscription(subscription) {
    realtimeSubscription = subscription;
}

function setCurrentPage(page) {
    currentPage = page;
}

function setIsLoading(loading) {
    isLoading = loading;
}

function setHasMoreProfessions(hasMore) {
    hasMoreProfessions = hasMore;
}

function setIsDarkMode(darkMode) {
    isDarkMode = darkMode;
}

function setProfessionObserver(observer) {
    professionObserver = observer;
}

// DOM elements
let totalVotesEl, avgPerceptionEl, professionCountEl, searchInputEl, searchButtonEl, 
    searchResultsEl, popularListEl, activityFeedEl, professionModal, professionDetails, 
    addProfessionModal, addProfessionForm, loadingOverlay, professionLoader, 
    backToTopBtn, themeToggleIcon, languageSelect;

// Function to initialize DOM elements
function initializeDOMElements(elements) {
    totalVotesEl = elements.totalVotesEl;
    avgPerceptionEl = elements.avgPerceptionEl;
    professionCountEl = elements.professionCountEl;
    searchInputEl = elements.searchInputEl;
    searchButtonEl = elements.searchButtonEl;
    searchResultsEl = elements.searchResultsEl;
    popularListEl = elements.popularListEl;
    activityFeedEl = elements.activityFeedEl;
    professionModal = elements.professionModal;
    professionDetails = elements.professionDetails;
    addProfessionModal = elements.addProfessionModal;
    addProfessionForm = elements.addProfessionForm;
    loadingOverlay = elements.loadingOverlay;
    professionLoader = elements.professionLoader;
    backToTopBtn = elements.backToTopBtn;
    themeToggleIcon = elements.themeToggleIcon;
    languageSelect = elements.languageSelect;
}

// Charts
let categoryChart;
let perceptionChart;

export { 
    supabaseUrl, 
    supabaseKey, 
    supabase,
    currentProfessionId,
    realtimeSubscription,
    currentPage,
    isLoading,
    hasMoreProfessions,
    isDarkMode,
    professionObserver,
    currentLanguage,
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
    categoryChart,
    perceptionChart,
    initializeDOMElements,
    setCurrentLanguage,
    initializeSupabase,
    initializeCategoryChart,
    initializePerceptionChart,
    setCurrentProfessionId,
    setRealtimeSubscription,
    setCurrentPage,
    setIsLoading,
    setHasMoreProfessions,
    setIsDarkMode,
    setProfessionObserver
};
