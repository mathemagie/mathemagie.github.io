// Instagram Video Recorder - Content Script
// Captures canvas elements and handles recording

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recordingStartTime = null;
let recordingTimer = null;
let canvas = null;
let currentSettings = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Content] Received message:', message.action);

    switch (message.action) {
        case 'startRecording':
            startRecording(message.format, message.settings)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep channel open for async response

        case 'stopRecording':
            stopRecording();
            sendResponse({ success: true });
            break;

        case 'downloadVideo':
            downloadVideo();
            sendResponse({ success: true });
            break;

        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

/**
 * Find canvas element on page
 */
function findCanvas() {
    // Try to find any canvas element
    const canvases = document.getElementsByTagName('canvas');

    if (canvases.length === 0) {
        throw new Error('No canvas found on page');
    }

    // Prefer larger canvases (likely the main animation)
    let largestCanvas = canvases[0];
    let maxArea = 0;

    for (let c of canvases) {
        const area = c.width * c.height;
        if (area > maxArea) {
            maxArea = area;
            largestCanvas = c;
        }
    }

    return largestCanvas;
}

/**
 * Get canvas dimensions (DO NOT resize - record as-is)
 */
function getCanvasDimensions() {
    // Return the actual canvas dimensions without modifying them
    return {
        width: canvas.width,
        height: canvas.height
    };
}

/**
 * Start recording canvas
 */
async function startRecording(format, settings) {
    if (isRecording) {
        throw new Error('Already recording');
    }

    try {
        // Find canvas
        canvas = findCanvas();
        console.log('[Content] Found canvas:', canvas.width, 'x', canvas.height);

        currentSettings = settings;

        // Get canvas dimensions (without resizing)
        const dimensions = getCanvasDimensions();

        // Notify popup of canvas size
        chrome.runtime.sendMessage({
            action: 'updateCanvasSize',
            size: `${canvas.width}×${canvas.height}`
        });

        // Create stream from canvas
        const stream = canvas.captureStream(settings.frameRate);
        console.log('[Content] Canvas stream created');

        // Try to add audio if available
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioTrack = audioStream.getAudioTracks()[0];
            stream.addTrack(audioTrack);
            console.log('[Content] Audio track added');
        } catch (e) {
            console.warn('[Content] No audio available:', e.message);
        }

        // Reset chunks
        recordedChunks = [];

        // Setup MediaRecorder with high quality
        const options = {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: settings.bitrate
        };

        // Fallback codecs
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8';
            console.log('[Content] Falling back to vp8');
        }

        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
            console.log('[Content] Falling back to default webm');
        }

        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunks.push(event.data);
                console.log('[Content] Chunk received:', event.data.size, 'bytes');
            }
        };

        mediaRecorder.onstop = () => {
            console.log('[Content] Recording stopped. Total chunks:', recordedChunks.length);
        };

        // Start recording
        mediaRecorder.start(100); // Capture every 100ms
        isRecording = true;
        recordingStartTime = Date.now();

        console.log('[Content] Recording started');

        // Start timer
        recordingTimer = setInterval(updateRecordingTime, 100);

        // Auto-stop after max duration
        setTimeout(() => {
            if (isRecording) {
                console.log('[Content] Auto-stopping after', settings.maxDuration, 'seconds');
                stopRecording();
            }
        }, settings.maxDuration * 1000);

        // Start FPS monitoring
        monitorFPS();

    } catch (error) {
        console.error('[Content] Recording error:', error);
        throw error;
    }
}

/**
 * Stop recording
 */
function stopRecording() {
    if (!isRecording) {
        console.warn('[Content] Not recording');
        return;
    }

    console.log('[Content] Stopping recording...');

    mediaRecorder.stop();
    isRecording = false;

    clearInterval(recordingTimer);

    // Stop all tracks
    const stream = mediaRecorder.stream;
    stream.getTracks().forEach(track => track.stop());
}

/**
 * Download recorded video
 */
function downloadVideo() {
    if (recordedChunks.length === 0) {
        console.error('[Content] No recorded data');
        return;
    }

    console.log('[Content] Creating download blob...');

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const timestamp = Date.now();
    const format = currentSettings ? 'video' : 'video';

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-recording-${timestamp}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    console.log('[Content] Download initiated');

    // Reset
    recordedChunks = [];
}

/**
 * Update recording time display
 */
function updateRecordingTime() {
    if (!recordingStartTime) return;

    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Send to popup
    chrome.runtime.sendMessage({
        action: 'updateRecordingTime',
        time: timeString
    });
}

/**
 * Monitor FPS
 */
let fpsCounter = 0;
let lastFpsTime = Date.now();

function monitorFPS() {
    if (!isRecording) return;

    fpsCounter++;

    if (Date.now() - lastFpsTime > 1000) {
        chrome.runtime.sendMessage({
            action: 'updateFPS',
            fps: fpsCounter
        });

        fpsCounter = 0;
        lastFpsTime = Date.now();
    }

    requestAnimationFrame(monitorFPS);
}

console.log('[Content] Instagram Video Recorder loaded');
