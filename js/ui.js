import logger from './logger.js';
import { 
    professionModal, 
    addProfessionModal, 
    currentProfessionId, 
    isDarkMode, 
    themeToggleIcon,
    setIsDarkMode,
    setCurrentProfessionId,
    currentLanguage
} from './config.js';
import translations from './i18n.js';

// Toggle between light and dark theme
function toggleTheme() {
    if (document.body.hasAttribute('data-theme')) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
        setIsDarkMode(false);
    } else {
        enableDarkMode();
    }
}

// Enable dark mode
function enableDarkMode() {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeToggleIcon.classList.remove('fa-moon');
    themeToggleIcon.classList.add('fa-sun');
    setIsDarkMode(true);
}

// Show toast notification
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'toast-' + Date.now();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

// Remove toast element with animation
function removeToast(toast) {
    toast.classList.add('removing');

    toast.addEventListener('animationend', () => {
        toast.remove();
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 3000);

    logger.warning(`错误提示: ${message}`);
}

// Show success message
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);

    logger.success(`成功提示: ${message}`);
}

// Close all modals
function closeModals() {
    professionModal.style.display = 'none';
    addProfessionModal.style.display = 'none';
    setCurrentProfessionId(null);
    logger.info('关闭所有模态框');
}

// Show add profession modal
function showAddProfessionModal() {
    addProfessionModal.style.display = 'block';
    logger.info('打开添加职业模态框');
}

// Apply translations to the page
function applyTranslations() {
    if (!translations[currentLanguage]) {
        logger.error(`Translations for language ${currentLanguage} not found`);
        return;
    }

    // Change HTML lang attribute
    document.documentElement.lang = currentLanguage;

    // Apply translations for elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Apply translations for placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });

    // Update page title
    if (translations[currentLanguage].title) {
        document.title = translations[currentLanguage].title;
    }
    
    // Handle the profession category dropdown specially
    const categoryDropdown = document.getElementById('profession-category');
    if (categoryDropdown) {
        // Store the currently selected value before updating options
        const selectedValue = categoryDropdown.value;
        
        // Clear the dropdown except for the first option (placeholder)
        while (categoryDropdown.options.length > 1) {
            categoryDropdown.remove(1);
        }
        
        // Add translated options 
        const categories = ['tech', 'education', 'healthcare', 'arts', 'business', 'service', 'other'];
        categories.forEach(category => {
            if (translations[currentLanguage][category]) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = translations[currentLanguage][category];
                categoryDropdown.appendChild(option);
            }
        });
        
        // Restore the previously selected value if possible
        if (selectedValue) {
            categoryDropdown.value = selectedValue;
        }
    }

    logger.info(`Language changed to ${currentLanguage}`);
}

// Animate counter for statistics
function animateCounter(element, start, end, decimals = 0, isDecimal = false) {
    const duration = 2000;
    const startTime = performance.now();

    function updateCount(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

        const currentCount = start + (end - start) * easeOutProgress;

        if (isDecimal) {
            element.textContent = currentCount.toFixed(decimals);
        } else {
            element.textContent = Math.floor(currentCount).toString();
        }

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }

    requestAnimationFrame(updateCount);
}

export { 
    toggleTheme, 
    enableDarkMode, 
    showToast, 
    removeToast, 
    showError, 
    showMessage, 
    closeModals, 
    showAddProfessionModal,
    applyTranslations,
    animateCounter
};
