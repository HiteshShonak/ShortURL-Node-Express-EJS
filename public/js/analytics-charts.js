// ========================================
// ANALYTICS CHARTS - All Chart.js Visualizations
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    // Set Chart.js defaults
    Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
    Chart.defaults.color = '#64748b';

    // Use data already parsed in head (no JSON.parse needed!)
    const trendLabelsData = trendLabels;
    const trendDataValues = trendData;
    const deviceData = deviceStats;
    const hourlyDataLocal = hourlyStats;
    const hourlyUniqueLocal = hourlyUnique;
    const sourceLabelsData = sourceLabels;
    const sourceDataValues = sourceData;
    const heatmapPointsData = heatmapPoints;

    // Store globally for map scripts
    window.heatmapPoints = heatmapPointsData;
    window.hourlyData = hourlyDataLocal;
    window.hourlyUnique = hourlyUniqueLocal;

    // === 1. LINE CHART ===
    const ctx = document.getElementById('clickChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendLabelsData,
            datasets: [{
                label: 'Clicks',
                data: trendDataValues,
                borderColor: '#4f46e5',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4f46e5',
                pointRadius: 5,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });

    // === 2. DEVICE DONUT CHART ===
    new Chart(document.getElementById('deviceChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Desktop', 'Mobile', 'Tablet', 'Bot'],
            datasets: [{
                data: deviceData,
                backgroundColor: ['#4f46e5', '#ec4899', '#3b82f6', '#6b7280'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom', 
                    labels: { usePointStyle: true, padding: 15 } 
                } 
            }
        }
    });

    // === 3. HOURLY CHART (Dual Bar) ===
    new Chart(document.getElementById('hourlyChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => i + ':00'),
            datasets: [
                {
                    label: 'Total Clicks',
                    data: hourlyDataLocal,
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                    borderRadius: 6,
                    borderSkipped: false,
                    order: 2
                },
                {
                    label: 'Unique Visitors', 
                    data: hourlyUniqueLocal,
                    backgroundColor: 'rgba(139, 92, 246, 0.9)',
                    borderRadius: 6,
                    borderSkipped: false,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    bodySpacing: 6,
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            return `Hour ${context[0].label}`;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const icon = context.datasetIndex === 0 ? '' : '';  
                            return `${icon} ${label}: ${value}`;
                        },
                        afterBody: function(context) {
                            const hour = context[0].dataIndex;
                            const total = hourlyDataLocal[hour];
                            const unique = hourlyUniqueLocal[hour];
                            if (total === 0) return 'Quality: No data';
                            const quality = Math.round((unique / total) * 100);
                            return `Quality Score: ${quality}% unique`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    stacked: false, 
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#64748b' }
                },
                y: { 
                    beginAtZero: true, 
                    stacked: false,
                    grid: { color: 'rgba(241, 245, 249, 0.8)' },
                    ticks: { precision: 0, font: { size: 11 }, color: '#64748b' }
                }
            },
            datasets: {
                bar: {
                    barPercentage: 0.9,
                    categoryPercentage: 0.8
                }
            },
            grouped: false
        }
    });

    // === 4. SOURCE BAR CHART ===
    new Chart(document.getElementById('sourceChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: sourceLabelsData,
            datasets: [{
                label: 'Visits',
                data: sourceDataValues,
                backgroundColor: '#10b981',
                borderRadius: 5,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { display: false } }
            }
        }
    });

    // === 5. RENDER GEOGRAPHIC LISTS ===
    renderGeoList(topCities, 'cityList');
    renderGeoList(topStates, 'stateList');
    renderGeoList(topCountries, 'countryList');

});

// Geographic list renderer function
function renderGeoList(data, containerId) {
    const container = document.getElementById(containerId);
    
    if (data.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">No data available</div>';
        return;
    }

    const maxCount = data[0].total;

    container.innerHTML = data.map(item => {
        const percentage = Math.round((item.total / maxCount) * 100);
        return `
            <div class="geo-item" onclick="openGeoModal('${item.name}', ${item.total}, ${item.unique})" style="cursor: pointer;">
                <div style="flex: 1;">
                    <div class="geo-name">${item.name}</div>
                    <div class="geo-bar" style="width: ${percentage}%;"></div>
                </div>
                <div class="geo-count">
                    <span class="geo-badge">${item.total}</span>
                </div>
            </div>
        `;
    }).join('');
}
