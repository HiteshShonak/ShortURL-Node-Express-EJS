// ========================================
// ANALYTICS MODALS - All Modal Logic
// ========================================

// State management
let currentViewMode = 'heatmap';
let currentDataSource = 'activity';
let tempViewMode = 'heatmap';
let tempDataSource = 'activity';

// === LEGEND MANAGEMENT ===
window.updateLegend = function(dataSource, viewMode) {
    const legend = document.getElementById('heatmapLegend');
    const legendTitle = document.getElementById('legendTitle');
    const legendGradient = document.getElementById('legendGradient');
    const legendMin = document.getElementById('legendMin');
    const legendMid = document.getElementById('legendMid');
    const legendMax = document.getElementById('legendMax');

    // Show/hide based on view mode
    if (viewMode === 'heatmap') {
        legend.style.display = 'block';
    } else {
        legend.style.display = 'none';
        return;
    }

    // Calculate max values from actual data
    const maxTotal = Math.max(...window.heatmapPoints.map(p => p.totalClicks), 1);
    const maxUnique = Math.max(...window.heatmapPoints.map(p => p.uniqueVisitors), 1);

    if (dataSource === 'activity') {
        // Activity mode - Green to Red
        legendTitle.textContent = 'Activity Intensity';
        legendGradient.style.background = 'linear-gradient(to right, #00D084, #FFB81C, #FF4D4D)';
        legendMin.textContent = '0';
        legendMid.textContent = Math.round(maxTotal / 2);
        legendMax.textContent = maxTotal;
    } else {
        // Quality mode - Cyan to Blue
        legendTitle.textContent = 'Quality Intensity';
        legendGradient.style.background = 'linear-gradient(to right, #1AE0FF, #00D4FF, #2A6BFF)';
        legendMin.textContent = '0';
        legendMid.textContent = Math.round(maxUnique / 2);
        legendMax.textContent = maxUnique;
    }
};

// === VIEW MODE MODAL ===
window.openViewModeModal = function() {
    tempViewMode = currentViewMode;
    
    document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
        radio.checked = radio.value === currentViewMode;
        const label = radio.closest('label');
        if (radio.checked) {
            label.style.borderColor = '#00D4FF';
            label.style.background = 'rgba(0, 212, 255, 0.12)';
        } else {
            label.style.borderColor = '#2A2A35';
            label.style.background = '#171721';
        }
    });

    document.getElementById('viewModeModal').classList.add('active');
};

window.selectViewMode = function(value) {
    tempViewMode = value;
    
    document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
        radio.checked = radio.value === value;
        const label = radio.closest('label');
        if (radio.value === value) {
            label.style.borderColor = '#00D4FF';
            label.style.background = 'rgba(0, 212, 255, 0.12)';
        } else {
            label.style.borderColor = '#2A2A35';
            label.style.background = '#171721';
        }
    });
};

window.applyViewMode = function() {
    currentViewMode = tempViewMode;
    document.getElementById('viewModeLabel').textContent = currentViewMode === 'heatmap' ? 'Heatmap' : 'Markers';
    toggleMapView(currentViewMode);
    updateLegend(currentDataSource, currentViewMode);
    closeViewModeModal(null, true);
};

window.closeViewModeModal = function(e, force) {
    if (force || e.target.id === 'viewModeModal') {
        document.getElementById('viewModeModal').classList.remove('active');
    }
};

// === DATA SOURCE MODAL ===
window.openDataSourceModal = function() {
    tempDataSource = currentDataSource;
    
    document.querySelectorAll('input[name="dataSource"]').forEach(radio => {
        radio.checked = radio.value === currentDataSource;
        const label = radio.closest('label');
        if (radio.checked) {
            const color = radio.value === 'activity' ? '#00D084' : '#00D4FF';
            label.style.borderColor = color;
            label.style.background = radio.value === 'activity' ? 'rgba(0, 208, 132, 0.14)' : 'rgba(0, 212, 255, 0.12)';
        } else {
            label.style.borderColor = '#2A2A35';
            label.style.background = '#171721';
        }
    });

    document.getElementById('dataSourceModal').classList.add('active');
};

window.selectDataSource = function(value) {
    tempDataSource = value;
    
    document.querySelectorAll('input[name="dataSource"]').forEach(radio => {
        radio.checked = radio.value === value;
        const label = radio.closest('label');
        if (radio.value === value) {
            const color = value === 'activity' ? '#00D084' : '#00D4FF';
            label.style.borderColor = color;
            label.style.background = value === 'activity' ? 'rgba(0, 208, 132, 0.14)' : 'rgba(0, 212, 255, 0.12)';
        } else {
            label.style.borderColor = '#2A2A35';
            label.style.background = '#171721';
        }
    });
};

window.applyDataSource = function() {
    currentDataSource = tempDataSource;
    document.getElementById('dataSourceLabel').textContent = currentDataSource === 'activity' ? 'Activity' : 'Quality';
    updateHeatmapData(currentDataSource);
    updateLegend(currentDataSource, currentViewMode);
    closeDataSourceModal(null, true);
};

window.closeDataSourceModal = function(e, force) {
    if (force || e.target.id === 'dataSourceModal') {
        document.getElementById('dataSourceModal').classList.remove('active');
    }
};

// === ESC KEY HANDLER (for all modals) ===
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeViewModeModal(null, true);
        closeDataSourceModal(null, true);
    }
});

// === INITIALIZE LEGEND ON LOAD ===
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => updateLegend('activity', 'heatmap'), 600);
});
