// Instagram Video Recorder - Background Service Worker

console.log('[Background] Instagram Video Recorder service worker loaded');

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Background] Extension installed:', details.reason);

    if (details.reason === 'install') {
        // Set default settings
        chrome.storage.local.set({
            format: 'square',
            settings: {
                frameRate: 60,
                bitrate: 10000000,
                maxDuration: 60
            }
        });

        // Open welcome page or instructions
        console.log('[Background] Default settings saved');
    }

    // Create context menu (moved here to ensure it's created after extension is ready)
    chrome.contextMenus.create({
        id: 'record-canvas',
        title: '🎬 Record Canvas for Instagram',
        contexts: ['all']
    });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] Message received:', message);

    // Relay messages if needed
    if (message.action === 'updateRecordingTime' ||
        message.action === 'updateCanvasSize' ||
        message.action === 'updateFPS') {
        // These are already handled by the popup directly
        return;
    }

    sendResponse({ received: true });
});

// Handle download events (if needed for conversion)
chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state && delta.state.current === 'complete') {
        console.log('[Background] Download completed:', delta.id);

        // Could potentially trigger auto-conversion here if we implement it
        // For now, users will use the shell scripts
    }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'record-canvas') {
        // Open popup or send message to content script
        chrome.action.openPopup();
    }
});
