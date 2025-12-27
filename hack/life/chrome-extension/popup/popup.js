// Instagram Video Recorder - Popup Controller
let currentFormat = 'square';
let settings = {
    frameRate: 60,
    bitrate: 10000000,
    maxDuration: 60
};

// Load saved settings
chrome.storage.local.get(['format', 'settings'], (result) => {
    if (result.format) {
        currentFormat = result.format;
        updateFormatUI();
    }
    if (result.settings) {
        settings = { ...settings, ...result.settings };
        updateSettingsUI();
    }
});

// Format selector
document.querySelectorAll('.format-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.format-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentFormat = card.getAttribute('data-format');

        // Save format preference
        chrome.storage.local.set({ format: currentFormat });
    });
});

// Settings listeners
document.getElementById('frameRate').addEventListener('change', (e) => {
    settings.frameRate = parseInt(e.target.value);
    saveSettings();
});

document.getElementById('bitrate').addEventListener('change', (e) => {
    settings.bitrate = parseInt(e.target.value);
    saveSettings();
});

document.getElementById('maxDuration').addEventListener('change', (e) => {
    settings.maxDuration = parseInt(e.target.value);
    saveSettings();
});

function saveSettings() {
    chrome.storage.local.set({ settings });
}

function updateFormatUI() {
    document.querySelectorAll('.format-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-format') === currentFormat);
    });
}

function updateSettingsUI() {
    document.getElementById('frameRate').value = settings.frameRate;
    document.getElementById('bitrate').value = settings.bitrate;
    document.getElementById('maxDuration').value = settings.maxDuration;
}

// Recording controls
document.getElementById('startBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to start recording
    chrome.tabs.sendMessage(tab.id, {
        action: 'startRecording',
        format: currentFormat,
        settings: settings
    }, (response) => {
        if (chrome.runtime.lastError) {
            updateStatus('error', 'Error: Reload page and try again');
            return;
        }

        if (response && response.success) {
            updateStatus('recording', 'Recording...');
            showRecordingUI();
        } else {
            updateStatus('error', response?.error || 'Failed to start recording');
        }
    });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
        action: 'stopRecording'
    }, (response) => {
        if (response && response.success) {
            updateStatus('ready', 'Recording stopped');
            showDownloadUI();
        }
    });
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
        action: 'downloadVideo'
    }, (response) => {
        if (response && response.success) {
            updateStatus('ready', 'Downloaded! Convert to MP4');
            hideDownloadUI();
        }
    });
});

function updateStatus(state, text) {
    const statusEl = document.getElementById('status');
    const statusText = document.getElementById('statusText');

    statusEl.className = 'status ' + state;
    statusText.textContent = text;
}

function showRecordingUI() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    document.getElementById('recordingInfo').style.display = 'block';

    // Disable format/settings during recording
    document.querySelectorAll('.format-card').forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.5';
    });
    document.querySelectorAll('select').forEach(select => {
        select.disabled = true;
    });
}

function showDownloadUI() {
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('recordingInfo').style.display = 'none';

    // Re-enable format/settings
    document.querySelectorAll('.format-card').forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
    });
    document.querySelectorAll('select').forEach(select => {
        select.disabled = false;
    });
}

function hideDownloadUI() {
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('startBtn').style.display = 'block';
}

// Listen for updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateRecordingTime') {
        document.getElementById('recordingTime').textContent = message.time;
    } else if (message.action === 'updateCanvasSize') {
        document.getElementById('canvasSize').textContent = message.size;
    } else if (message.action === 'updateFPS') {
        document.getElementById('currentFps').textContent = message.fps;
    }
});
