// Chart setup
document.addEventListener("DOMContentLoaded", function () {
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
    Chart.defaults.color = '#475569';

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
    gradient.addColorStop(0, 'rgba(67, 56, 202, 0.4)');
    gradient.addColorStop(1, 'rgba(67, 56, 202, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendLabelsData,
            datasets: [{
                label: 'Clicks',
                data: trendDataValues,
                borderColor: '#4338CA',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4338CA',
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
                    backgroundColor: '#0F172A',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5], color: '#F1F5F9', drawBorder: false },
                    ticks: { font: { weight: '600' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { weight: '500' } }
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
                backgroundColor: ['#4338CA', '#0EA5E9', '#6366F1', '#94A3B8'],
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
                    labels: { usePointStyle: true, padding: 15, font: { weight: '600' } }
                },
                tooltip: { backgroundColor: '#0F172A', padding: 12, cornerRadius: 8 }
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
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                    order: 2
                },
                {
                    label: 'Unique Visitors',
                    data: hourlyUniqueLocal,
                    backgroundColor: 'rgba(67, 56, 202, 0.9)',
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
                    labels: { usePointStyle: true, pointStyle: 'circle', padding: 15, font: { size: 12, weight: '600' } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#0F172A',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    bodySpacing: 6,
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
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
                x: { stacked: false, grid: { display: false }, ticks: { font: { size: 10, weight: '500' }, color: '#64748B' } },
                y: { beginAtZero: true, stacked: false, grid: { color: 'rgba(241, 245, 249, 0.8)', drawBorder: false }, ticks: { precision: 0, font: { size: 11, weight: '500' }, color: '#64748B' } }
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
                backgroundColor: '#0EA5E9',
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#0F172A', padding: 12, cornerRadius: 8 }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { weight: '500' } } },
                y: { grid: { display: false }, ticks: { font: { weight: '600' } } }
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
