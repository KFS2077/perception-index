// Generate stars HTML based on rating
function getStarsHTML(rating) {
    if (!rating) rating = 0;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star" style="color: #ffd700;"></i>';
    }

    // Half star
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt" style="color: #ffd700;"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star" style="color: #ffd700;"></i>';
    }

    return starsHTML;
}

// Format time for display
function formatTime(date) {
    // Ensure date is a proper Date object
    if (!(date instanceof Date)) {
        // Try to convert to Date object if it's a string or timestamp
        try {
            date = new Date(date);
        } catch (e) {
            // console.error('Invalid date format:', date);
            return 'Invalid date';
        }
    }
    
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) {
        return 'moments ago';
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}minutes ago`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}hours ago`;
    } else {
        const options = {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
        return date.toLocaleDateString('zh-CN', options);
    }
}

export { getStarsHTML, formatTime };
