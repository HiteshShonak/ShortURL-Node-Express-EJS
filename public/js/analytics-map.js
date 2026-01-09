// ========================================
// ANALYTICS MAP - Zoom-Adaptive Heatmap (Optimized for Low Data)
// ========================================

// Performance optimization for Canvas (fixes warning)
HTMLCanvasElement.prototype.getContext = (function(origFn) {
    return function(type, attributes) {
        if (type === '2d') {
            attributes = attributes || {};
            attributes.willReadFrequently = true;
        }
        return origFn.call(this, type, attributes);
    };
})(HTMLCanvasElement.prototype.getContext);

document.addEventListener("DOMContentLoaded", function() {
    
    // === LEAFLET MAP SETUP ===
    const map = L.map('regions_div', {
        attributionControl: false
    }).setView([20.5937, 78.9629], 5);
    
    // Minimal legal attribution
    L.control.attribution({
        position: 'bottomright',
        prefix: '<a href="https://leafletjs.com" style="font-size:8px;color:#94a3b8;">Leaflet</a>'
    }).addTo(map);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/copyright" style="font-size:8px;color:#94a3b8;">OSM</a>',
        maxZoom: 19
    }).addTo(map);

    window.leafletMap = map;
    window.currentDataSource = 'activity';
    window.currentViewMode = 'heatmap';

    // === MARKER LAYER ===
    const markerLayer = L.layerGroup();
    window.heatmapPoints.forEach(p => {
        const quality = p.totalClicks > 0 ? Math.round((p.uniqueVisitors / p.totalClicks) * 100) : 0;
        
        // ✅ UPDATED POPUP WITH INFO ICON
        const popupContent = `
            <div style="min-width: 200px; font-family: 'Segoe UI', system-ui, sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">📍</span>
                        <span style="font-weight: 700; font-size: 15px; color: #1e293b;">${p.location}</span>
                        <span class="info-icon-trigger" style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; font-size: 11px; font-weight: 700; cursor: help; opacity: 0.7; transition: all 0.2s;">ℹ</span>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 13px; color: #64748b; font-weight: 600;">🟢 Activity</span>
                        <span style="font-size: 16px; font-weight: 700; color: #10b981;">${p.totalClicks}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 13px; color: #64748b; font-weight: 600;">🟣 Quality</span>
                        <span style="font-size: 16px; font-weight: 700; color: #8b5cf6;">${p.uniqueVisitors}</span>
                    </div>
                </div>
                
                <div style="margin-top: 6px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; color: #64748b; font-weight: 600;">💎 Ratio</span>
                        <span style="font-size: 14px; font-weight: 700; color: #4f46e5;">${quality}%</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; margin-top: 4px; overflow: hidden;">
                        <div style="width: ${quality}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #4f46e5); border-radius: 2px;"></div>
                    </div>
                </div>
            </div>
        `;

        L.circleMarker([p.lat, p.lng], {
            radius: 8,
            fillColor: '#4f46e5',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindPopup(popupContent, { maxWidth: 250, className: 'custom-popup' })
        .addTo(markerLayer);
    });

    window.markerLayer = markerLayer;

    // === CALCULATE MAX VALUES ===
    const maxTotal = Math.max(...window.heatmapPoints.map(p => p.totalClicks), 1);
    const maxUnique = Math.max(...window.heatmapPoints.map(p => p.uniqueVisitors), 1);
    
    window.currentMaxTotal = maxTotal;
    window.currentMaxUnique = maxUnique;


    // === CREATE HEATMAP FUNCTION (ZOOM-ADAPTIVE) ===
    function createHeatmap(source, zoom) {
        const isActivity = source === 'activity';
        const maxValue = isActivity ? maxTotal : maxUnique;
        
        // ✅ POWER BOOST: 0.4 for vibrant colors with low data
        const heatmapData = window.heatmapPoints.map(p => {
            const rawValue = isActivity ? p.totalClicks : p.uniqueVisitors;
            let intensity = rawValue / maxValue;
            
            // Power boost: 0.4 = very vibrant (perfect for low data)
            intensity = Math.pow(intensity, 0.4);
            
            return [p.lat, p.lng, intensity];
        });

        // ✅ ZOOM-BASED PARAMETERS (Optimized for vibrant colors)
        let radius, blur, maxIntensity;
        
        if (zoom <= 4) {
            radius = 25;
            blur = 15;
            maxIntensity = 0.3;  // Lower = more vibrant
        } else if (zoom <= 6) {
            radius = 30;
            blur = 18;
            maxIntensity = 0.4;
        } else if (zoom <= 8) {
            radius = 35;
            blur = 20;
            maxIntensity = 0.5;
        } else {
            radius = 40;
            blur = 22;
            maxIntensity = 0.6;
        }


        const gradient = isActivity ? {
            0.0: '#10b981',   // Green (low)
            0.2: '#84cc16',   // Light green
            0.4: '#fbbf24',   // Yellow
            0.6: '#f59e0b',   // Orange
            0.8: '#f97316',   // Dark orange
            1.0: '#ef4444'    // Red (high)
        } : {
            0.0: '#8b5cf6',   // Purple
            0.2: '#a78bfa',
            0.4: '#c084fc',   // Light purple
            0.6: '#ec4899',   // Pink
            0.8: '#6366f1',   // Indigo
            1.0: '#4f46e5'    // Blue
        };

        return L.heatLayer(heatmapData, {
            radius: radius,
            blur: blur,
            max: maxIntensity,
            minOpacity: 0.5,
            gradient: gradient
        });
    }

    // === INITIAL HEATMAP ===
    window.heatLayer = createHeatmap('activity', map.getZoom());
    window.heatLayer.addTo(map);

    // === ✅ ZOOM EVENT LISTENER ===
    map.on('zoomend', function() {
        const currentZoom = map.getZoom();
        
        if (window.heatLayer) {
            map.removeLayer(window.heatLayer);
        }
        
        window.heatLayer = createHeatmap(window.currentDataSource, currentZoom);
        
        if (window.currentViewMode === 'heatmap') {
            window.heatLayer.addTo(map);
        }
    });

    // === ✅ INFO ICON TOOLTIP HANDLERS (Using Event Delegation) ===
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.info-icon-trigger')) {
            const icon = e.target.closest('.info-icon-trigger');
            const tooltip = document.getElementById('globalInfoTooltip');
            const arrow = document.getElementById('tooltipArrow');
            
            if (!tooltip) return;
            
            const rect = icon.getBoundingClientRect();
            
            // Position tooltip to the right of the icon
            tooltip.style.left = (rect.right + 10) + 'px';
            tooltip.style.top = (rect.top + rect.height / 2) + 'px';
            tooltip.style.transform = 'translateY(-50%)';
            
            // Position arrow on the left side pointing to the icon
            arrow.style.left = '-6px';
            arrow.style.top = '50%';
            arrow.style.transform = 'translateY(-50%)';
            arrow.style.borderRight = '6px solid #1e293b';
            arrow.style.borderTop = '6px solid transparent';
            arrow.style.borderBottom = '6px solid transparent';
            arrow.style.borderLeft = 'none';
            
            // Show tooltip
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
            
            // Highlight icon
            icon.style.opacity = '1';
            icon.style.background = '#4f46e5';
            icon.style.color = 'white';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.info-icon-trigger')) {
            const tooltip = document.getElementById('globalInfoTooltip');
            const icon = e.target.closest('.info-icon-trigger');
            
            if (!tooltip) return;
            
            // Hide tooltip
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            
            // Reset icon style
            icon.style.opacity = '0.7';
            icon.style.background = '#e0e7ff';
            icon.style.color = '#4f46e5';
        }
    });

    setTimeout(() => map.invalidateSize(), 500);

});

// === MAP TOGGLE FUNCTIONS ===
window.toggleMapView = function(view) {
    window.currentViewMode = view;
    
    if (view === 'heatmap') {
        window.leafletMap.removeLayer(window.markerLayer);
        window.leafletMap.addLayer(window.heatLayer);
    } else {
        window.leafletMap.removeLayer(window.heatLayer);
        window.leafletMap.addLayer(window.markerLayer);
    }
};

// === UPDATE HEATMAP DATA SOURCE ===
window.updateHeatmapData = function(source) {
    window.currentDataSource = source;
    
    if (window.heatLayer) {
        window.leafletMap.removeLayer(window.heatLayer);
    }
    
    const currentZoom = window.leafletMap.getZoom();
    const isActivity = source === 'activity';
    const maxValue = isActivity ? window.currentMaxTotal : window.currentMaxUnique;
    
    // ✅ POWER BOOST: 0.4 for vibrant colors
    const heatmapData = window.heatmapPoints.map(p => {
        const rawValue = isActivity ? p.totalClicks : p.uniqueVisitors;
        let intensity = rawValue / maxValue;
        intensity = Math.pow(intensity, 0.4);  // Power boost
        return [p.lat, p.lng, intensity];
    });

    // ✅ ZOOM-BASED SETTINGS (matching createHeatmap function)
    let radius, blur, maxIntensity;
    if (currentZoom <= 4) {
        radius = 25; blur = 15; maxIntensity = 0.3;
    } else if (currentZoom <= 6) {
        radius = 30; blur = 18; maxIntensity = 0.4;
    } else if (currentZoom <= 8) {
        radius = 35; blur = 20; maxIntensity = 0.5;
    } else {
        radius = 40; blur = 22; maxIntensity = 0.6;
    }

    const gradient = isActivity ? {
        0.0: '#10b981',
        0.2: '#84cc16',
        0.4: '#fbbf24',
        0.6: '#f59e0b',
        0.8: '#f97316',
        1.0: '#ef4444'
    } : {
        0.0: '#8b5cf6',
        0.2: '#a78bfa',
        0.4: '#c084fc',
        0.6: '#ec4899',
        0.8: '#6366f1',
        1.0: '#4f46e5'
    };

    window.heatLayer = L.heatLayer(heatmapData, {
        radius: radius,
        blur: blur,
        max: maxIntensity,
        minOpacity: 0.5,
        gradient: gradient
    });

    if (window.currentViewMode === 'heatmap') {
        window.leafletMap.addLayer(window.heatLayer);
    }

};