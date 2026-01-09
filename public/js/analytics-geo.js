// ========================================
// ANALYTICS GEO - Stats & Geographic Modals
// ========================================

// === STATS MODAL ===
const modal = document.getElementById('statsModal');
const mTitle = document.getElementById('modalTitle');
const mRaw = document.getElementById('modalRaw');
const mUnique = document.getElementById('modalUnique');
const mIcon = document.getElementById('modalIcon');
const mIconBg = document.getElementById('modalIconBg');
const mBar = document.getElementById('qualityBar');
const mScore = document.getElementById('qualityScore');

function openModal(type) {
    const data = modalData[type];
    if (!data) return;

    mTitle.innerText = data.title;
    mRaw.innerText = data.raw;
    mUnique.innerText = data.unique;
    mIcon.className = `ph ${data.icon}`;
    mIconBg.style.color = data.color;
    mIconBg.style.background = type === 'total' ? '#e0e7ff' : '#dcfce7';
    mRaw.style.color = data.color;

    const ratio = data.raw > 0 ? Math.round((data.unique / data.raw) * 100) : 0;
    mBar.style.width = ratio + '%';
    mBar.style.backgroundColor = data.color;
    mScore.innerText = ratio + '% Unique';

    modal.classList.add('active');
}

function closeModal(e, force) {
    if (force || e.target === modal) {
        modal.classList.remove('active');
    }
}

// === GEOGRAPHIC MODAL ===
const geoModal = document.getElementById('geoModal');
const geoModalTitle = document.getElementById('geoModalTitle');
const geoModalTotal = document.getElementById('geoModalTotal');
const geoModalUnique = document.getElementById('geoModalUnique');
const geoQualityBar = document.getElementById('geoQualityBar');
const geoQualityScore = document.getElementById('geoQualityScore');

function openGeoModal(name, total, unique) {
    geoModalTitle.innerText = name;
    geoModalTotal.innerText = total;
    geoModalUnique.innerText = unique;

    const ratio = total > 0 ? Math.round((unique / total) * 100) : 0;
    geoQualityBar.style.width = ratio + '%';
    geoQualityScore.innerText = ratio + '% Unique';

    geoModal.classList.add('active');
}

function closeGeoModal(e, force) {
    if (force || e.target === geoModal) {
        geoModal.classList.remove('active');
    }
}

// === ESC KEY HANDLER (for stats/geo modals) ===
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal(null, true);
        closeGeoModal(null, true);
    }
});

