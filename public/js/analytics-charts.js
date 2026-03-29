// Chart setup
document.addEventListener("DOMContentLoaded", function () {
    Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
    Chart.defaults.color = '#A0A0B8';

    const trendLabelsData = trendLabels;
    const trendDataValues = trendData;
    const deviceData = deviceStats;
    const hourlyDataLocal = hourlyStats;
    const hourlyUniqueLocal = hourlyUnique;
    const sourceLabelsData = sourceLabels;
    const sourceDataValues = sourceData;
    const heatmapPointsData = heatmapPoints;

    window.heatmapPoints = heatmapPointsData;
    window.hourlyData = hourlyDataLocal;
    window.hourlyUnique = hourlyUniqueLocal;

    // Line chart
    const ctx = document.getElementById('clickChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.22)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.02)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendLabelsData,
            datasets: [{
                label: 'Clicks',
                data: trendDataValues,
                borderColor: '#00D4FF',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#0D0D12',
                pointBorderColor: '#00D4FF',
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#171721',
                    titleColor: '#E6E6F0',
                    bodyColor: '#E6E6F0',
                    padding: 12,
                    cornerRadius: 4,
                    displayColors: false,
                    borderColor: '#2A2A35',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: '#2A2A35', drawBorder: false },
                    ticks: { font: { weight: '600' }, color: '#A0A0B8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { weight: '500' }, color: '#A0A0B8' }
                }
            }
        }
    });

    // Device donut
    new Chart(document.getElementById('deviceChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Desktop', 'Mobile', 'Tablet', 'Bot'],
            datasets: [{
                data: deviceData,
                backgroundColor: ['#00D4FF', '#FFB81C', '#00D084', '#2A2A35'],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 15, font: { weight: '600' }, color: '#A0A0B8' }
                },
                tooltip: { backgroundColor: '#171721', padding: 12, cornerRadius: 4, titleColor: '#E6E6F0', bodyColor: '#E6E6F0', borderColor: '#2A2A35', borderWidth: 1 }
            }
        }
    });

    // Hourly bar
    new Chart(document.getElementById('hourlyChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => i + ':00'),
            datasets: [
                {
                    label: 'Total Clicks',
                    data: hourlyDataLocal,
                    backgroundColor: 'rgba(0, 212, 255, 0.8)',
                    borderRadius: 4,
                    borderSkipped: false,
                    order: 2
                },
                {
                    label: 'Unique Visitors',
                    data: hourlyUniqueLocal,
                    backgroundColor: 'rgba(255, 184, 28, 0.8)',
                    borderRadius: 4,
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
                    labels: { usePointStyle: true, pointStyle: 'circle', padding: 15, font: { size: 12, weight: '600' }, color: '#A0A0B8' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#171721',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    bodySpacing: 6,
                    borderColor: '#2A2A35',
                    borderWidth: 1,
                    cornerRadius: 4,
                    titleColor: '#E6E6F0',
                    bodyColor: '#E6E6F0',
                    callbacks: {
                        title: (ctx) => `Hour ${ctx[0].label}`,
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
                        afterBody: (ctx) => {
                            const hour = ctx[0].dataIndex;
                            const total = hourlyDataLocal[hour];
                            const unique = hourlyUniqueLocal[hour];
                            if (total === 0) return 'Quality: No data';
                            return `Quality Score: ${Math.round((unique / total) * 100)}% unique`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: false, grid: { display: false }, ticks: { font: { size: 10, weight: '500' }, color: '#A0A0B8' } },
                y: { beginAtZero: true, stacked: false, grid: { color: '#2A2A35', drawBorder: false }, ticks: { precision: 0, font: { size: 11, weight: '500' }, color: '#A0A0B8' } }
            },
            datasets: { bar: { barPercentage: 0.9, categoryPercentage: 0.8 } },
            grouped: false
        }
    });

    // Source bar
    new Chart(document.getElementById('sourceChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: sourceLabelsData,
            datasets: [{
                label: 'Visits',
                data: sourceDataValues,
                backgroundColor: '#00D4FF',
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#171721', padding: 12, cornerRadius: 4, titleColor: '#E6E6F0', bodyColor: '#E6E6F0', borderColor: '#2A2A35', borderWidth: 1 }
            },
            scales: {
                x: { grid: { color: '#2A2A35' }, ticks: { font: { weight: '500' }, color: '#A0A0B8' } },
                y: { grid: { display: false }, ticks: { font: { weight: '600' }, color: '#A0A0B8' } }
            }
        }
    });

    // Geo lists
    renderGeoList(topCities, 'cityList');
    renderGeoList(topStates, 'stateList');
    renderGeoList(topCountries, 'countryList');
});

function renderGeoList(data, containerId) {
    const container = document.getElementById(containerId);

    if (data.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #A0A0B8;">No data available</div>';
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
