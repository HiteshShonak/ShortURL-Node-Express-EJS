// ========================================
// HOME PAGE - Modal Functionality
// ========================================

// Global variables
let currentShortId = "";
let deleteTargetId = "";

// === SHARE MODAL FUNCTIONS ===

function openShareModal(shortId) {
    currentShortId = shortId;
    const modal = document.getElementById('shareModal');
    modal.classList.add('active');
}

function closeShareModal(e, force) {
    const modal = document.getElementById('shareModal');
    if (force || e.target === modal) {
        modal.classList.remove('active');
    }
}

function shareTo(platform) {
    if (!currentShortId) return;

    const baseUrl = `${window.location.origin}/url/${currentShortId}`;
    
    // Instagram or Copy -> Copy to clipboard
    if (platform === 'copy' || platform === 'instagram') {
        const source = platform === 'instagram' ? 'instagram' : 'Direct';
        const finalUrl = `${baseUrl}?source=${source}`;
        
        navigator.clipboard.writeText(finalUrl).then(() => {
            document.getElementById('shareModal').classList.remove('active');
            showNotification((platform === 'instagram' ? 'Instagram' : 'Trackable') + ' link copied!');
        }).catch(() => {
            alert('Failed to copy link');
        });
        return;
    }

    // Open sharing app with tracked URL
    const trackedUrl = `${baseUrl}?source=${platform}`;
    const encodedUrl = encodeURIComponent(trackedUrl);
    const text = encodeURIComponent("Check out this link: ");
    
    let shareUrl = "";
    switch(platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}${encodedUrl}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
    }

    if(shareUrl) {
        window.open(shareUrl, '_blank');
        document.getElementById('shareModal').classList.remove('active');
    }
}

// === DELETE MODAL FUNCTIONS ===

function openDeleteModal(shortId) {
    deleteTargetId = shortId;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal(e, force) {
    const modal = document.getElementById('deleteModal');
    if (force || e.target === modal) {
        modal.classList.remove('active');
    }
}

async function confirmDelete() {
    if (!deleteTargetId) return;

    try {
        const response = await fetch(`/url/delete/${deleteTargetId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            window.location.reload();            
        } else {
            closeDeleteModal(null, true);
            showNotification(result.error || "Failed to delete link");
        }
    } catch (err) {
        console.error(err);
        closeDeleteModal(null, true);
        showNotification("Server connection failed. Try again.");
    }

}

// === NOTIFICATION HELPER ===

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// === EVENT LISTENERS ===

document.addEventListener('DOMContentLoaded', function() {
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if(e.key === "Escape") {
            closeShareModal(null, true);
            closeDeleteModal(null, true);
        }
    });
    
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
