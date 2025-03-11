import logger from './logger.js';
import { 
    supabase, 
    categoryChart, 
    perceptionChart, 
    initializeCategoryChart, 
    initializePerceptionChart 
} from './config.js';

// Set up charts
function setupCharts() {
    // Category distribution chart
    loadCategoryChart();

    // Perception distribution chart
    loadPerceptionChart();
}

// Load category distribution chart
async function loadCategoryChart() {
    try {
        logger.db('查询', '获取职业类别分布数据');
        const {data, error} = await supabase
            .from('professions')
            .select('category, count:total_ratings');

        if (error) throw error;
        logger.db('成功', `获取到 ${data.length} 条类别数据`);

        // Aggregate by category
        const categoryData = {};
        data.forEach(item => {
            if (!categoryData[item.category]) {
                categoryData[item.category] = 0;
            }
            categoryData[item.category] += item.count;
        });

        const labels = Object.keys(categoryData);
        const values = Object.values(categoryData);

        const ctx = document.getElementById('category-chart').getContext('2d');

        if (categoryChart) {
            categoryChart.destroy();
        }

        initializeCategoryChart(new Chart(ctx, {
            type: 'pie', data: {
                labels: labels, datasets: [{
                    data: values,
                    backgroundColor: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#4895ef', '#560bad', '#b5179e'],
                    borderWidth: 1
                }]
            }, options: {
                responsive: true, plugins: {
                    legend: {
                        position: 'right',
                    }, tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }));

        logger.success('职业类别分布图表加载完成');
    } catch (error) {
        logger.error('加载职业类别图表失败', error);
    }
}

// Load perception distribution chart
async function loadPerceptionChart() {
    try {
        logger.db('查询', '获取感知指数分布数据');
        
        // First approach: Try to get raw scores
        const {data: rawRatings, error: rawError} = await supabase
            .from('ratings')
            .select('score');
            
        if (rawError) throw rawError;
        logger.db('成功', `获取到 ${rawRatings.length} 条评分数据`);

        // Count ratings by score
        const scoreDistribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        rawRatings.forEach(rating => {
            if (rating.score >= 1 && rating.score <= 5) {
                scoreDistribution[rating.score]++;
            }
        });

        const ctx = document.getElementById('perception-chart').getContext('2d');

        if (perceptionChart) {
            perceptionChart.destroy();
        }

        initializePerceptionChart(new Chart(ctx, {
            type: 'bar', data: {
                labels: ['very low', 'low', 'normal', 'higher', 'much higher'], datasets: [{
                    label: 'Rating Distribution',
                    data: [scoreDistribution[1], scoreDistribution[2], scoreDistribution[3], scoreDistribution[4], scoreDistribution[5]],
                    backgroundColor: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
                    borderWidth: 1
                }]
            }, options: {
                responsive: true, scales: {
                    y: {
                        beginAtZero: true, title: {
                            display: true, text: 'Number of Ratings'
                        }
                    }, x: {
                        title: {
                            display: true, text: 'Perception Level'
                        }
                    }
                }, plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }));

        logger.success('感知指数分布图表加载完成');
    } catch (error) {
        logger.error('加载感知指数图表失败', error);
    }
}

export { setupCharts, loadCategoryChart, loadPerceptionChart };
