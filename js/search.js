import logger from './logger.js';
import { supabase, searchInputEl, searchResultsEl } from './config.js';
import { showError, showAddProfessionModal } from './ui.js';
import { showProfessionDetails } from './professions.js';

// Handle search input
function handleSearchInput() {
    const query = searchInputEl.value.trim();

    if (query.length === 0) {
        searchResultsEl.classList.remove('active');
        return;
    }

    searchProfessions(query);
}

// Handle search button click
function handleSearch() {
    const query = searchInputEl.value.trim();

    if (query.length === 0) {
        return;
    }

    searchProfessions(query);
}

// Search professions
async function searchProfessions(query) {
    try {
        logger.db('查询', `搜索职业: "${query}"`);
        const {data, error} = await supabase
            .from('professions')
            .select('*')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
            .order('total_ratings', {ascending: false})
            .limit(5);

        if (error) throw error;
        logger.db('成功', `搜索到 ${data.length} 个匹配结果`);

        searchResultsEl.innerHTML = '';
        searchResultsEl.classList.add('active');

        if (data.length === 0) {
            // No results, offer to add new profession
            const item = document.createElement('div');
            item.className = 'search-result-item add-new';
            item.innerHTML = `
                <div>"${query}" Not Found</div>
                <div class="add-new">+ Add New Career</div>
            `;

            item.addEventListener('click', () => {
                document.getElementById('profession-name').value = query;
                showAddProfessionModal();
            });

            searchResultsEl.appendChild(item);
            return;
        }

        // Display search results
        data.forEach(profession => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            item.innerHTML = `
                <div class="result-main">
                    <div class="result-title">${profession.name}</div>
                    <div class="category">${profession.category}</div>
                </div>
                <div class="result-details">
                    <div class="stats">
                        <span class="rating-value">${profession.avg_rating.toFixed(1)}/5</span>
                        <span class="voter-count">${profession.total_ratings} Voted</span>
                    </div>
                    <div class="action-buttons">
                        <button class="view-details-btn">View Details</button>
                        <button class="rate-now-btn">Rate Now</button>
                    </div>
                </div>
            `;

            // Add event listeners to both buttons
            const viewDetailsBtn = item.querySelector('.view-details-btn');
            const rateNowBtn = item.querySelector('.rate-now-btn');

            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the parent item click
                searchResultsEl.classList.remove('active');
                showProfessionDetails(profession.id);
            });

            rateNowBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the parent item click
                searchResultsEl.classList.remove('active');
                showProfessionDetails(profession.id);
                // Focus on the rating slider
                setTimeout(() => {
                    const slider = document.getElementById('agi-perception-slider');
                    if (slider) {
                        slider.focus();
                        // Scroll to the slider
                        slider.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            });

            // The entire item still navigates to the profession details
            item.addEventListener('click', () => {
                searchResultsEl.classList.remove('active');
                showProfessionDetails(profession.id);
            });

            searchResultsEl.appendChild(item);
        });
    } catch (error) {
        logger.error('搜索职业失败', error);
        showError('搜索失败，请重试');
    }
}

export { handleSearchInput, handleSearch, searchProfessions };
