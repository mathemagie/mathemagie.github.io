/**
 * Audio Manager for ISS Tracker
 * Real-Time ISS Tracker with Mercator Projection
 * 
 * Handles audio feedback when ISS crosses Mercator grid lines
 * Includes Web Audio API and HTML5 Audio fallback
 */

class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.isMuted = false;
        this.volume = 0.7;
        
        // Audio context and nodes
        this.audioContext = null;
        this.gainNode = null;
        this.sounds = new Map();
        
        // Grid crossing detection
        this.lastPosition = null;
        this.gridSpacing = 10; // degrees
        this.crossingTolerance = 0.1; // degrees
        
        // Audio file configuration
        this.soundConfig = {
            gridCross: {
                frequencies: [440, 554.37], // A4 and C#5
                duration: 0.3,
                volume: 0.8
            },
            majorGridCross: {
                frequencies: [440, 554.37, 659.25], // A4, C#5, E5
                duration: 0.5,
                volume: 1.0
            },
            error: {
                frequencies: [220], // A3
                duration: 0.2,
                volume: 0.6
            }
        };
        
        // Browser compatibility
        this.webAudioSupported = false;
        this.html5AudioSupported = false;
        
        this.initialize();
    }
    
    /**
     * Initialize audio system with feature detection
     */
    async initialize() {
        console.log('Initializing Audio Manager...');
        
        // Test Web Audio API support
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.webAudioSupported = true;
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            
            console.log('Web Audio API initialized successfully');
            
        } catch (error) {
            console.warn('Web Audio API not supported, falling back to HTML5 Audio');
            this.webAudioSupported = false;
        }
        
        // Test HTML5 Audio support
        try {
            const testAudio = new Audio();
            this.html5AudioSupported = testAudio.canPlayType && 
                (testAudio.canPlayType('audio/mp3') !== '' || 
                 testAudio.canPlayType('audio/ogg') !== '');
            
            if (this.html5AudioSupported) {
                console.log('HTML5 Audio fallback available');
            }
            
        } catch (error) {
            console.warn('HTML5 Audio not supported');
            this.html5AudioSupported = false;
        }
        
        // Check if any audio method is available
        if (!this.webAudioSupported && !this.html5AudioSupported) {
            console.error('No audio support detected');
            this.isEnabled = false;
            return;
        }
        
        // Pre-generate audio buffers for Web Audio API
        if (this.webAudioSupported) {
            await this.generateAudioBuffers();
        }
        
        console.log('Audio Manager initialized:', {
            webAudio: this.webAudioSupported,
            html5Audio: this.html5AudioSupported,
            enabled: this.isEnabled
        });
    }
    
    /**
     * Generate audio buffers for different sound types
     */
    async generateAudioBuffers() {
        for (const [soundType, config] of Object.entries(this.soundConfig)) {
            try {
                const buffer = this.generateToneBuffer(
                    config.frequencies,
                    config.duration,
                    config.volume
                );
                this.sounds.set(soundType, buffer);
            } catch (error) {
                console.error(`Failed to generate ${soundType} audio buffer:`, error);
            }
        }
    }
    
    /**
     * Generate audio buffer with multiple frequencies (chord)
     * @param {number[]} frequencies - Array of frequencies in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume level (0-1)
     * @returns {AudioBuffer} Generated audio buffer
     */
    generateToneBuffer(frequencies, duration, volume) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            let sample = 0;
            
            // Add all frequencies together
            for (const freq of frequencies) {
                sample += Math.sin(2 * Math.PI * freq * i / sampleRate);
            }
            
            // Normalize by number of frequencies
            sample /= frequencies.length;
            
            // Apply envelope (fade in/out to prevent clicks)
            const envelope = this.calculateEnvelope(i, length);
            data[i] = sample * volume * envelope;
        }
        
        return buffer;
    }
    
    /**
     * Calculate envelope for smooth audio transitions
     * @param {number} sample - Current sample index
     * @param {number} totalSamples - Total number of samples
     * @returns {number} Envelope value (0-1)
     */
    calculateEnvelope(sample, totalSamples) {
        const fadeLength = totalSamples * 0.1; // 10% fade in/out
        
        if (sample < fadeLength) {
            // Fade in
            return sample / fadeLength;
        } else if (sample > totalSamples - fadeLength) {
            // Fade out
            return (totalSamples - sample) / fadeLength;
        } else {
            // Sustain
            return 1.0;
        }
    }
    
    /**
     * Check if ISS has crossed grid lines and play appropriate sound
     * @param {number} currentLat - Current latitude
     * @param {number} currentLng - Current longitude
     */
    checkGridCrossing(currentLat, currentLng) {
        if (!this.isEnabled || this.isMuted || !this.lastPosition) {
            this.lastPosition = { lat: currentLat, lng: currentLng };
            return;
        }
        
        const meridianCrossed = this.detectLineCrossing(
            this.lastPosition.lng, 
            currentLng, 
            this.gridSpacing
        );
        
        const parallelCrossed = this.detectLineCrossing(
            this.lastPosition.lat, 
            currentLat, 
            this.gridSpacing
        );
        
        if (meridianCrossed || parallelCrossed) {
            // Check if it's a major grid line (30-degree intervals)
            const isMajorGrid = 
                this.detectLineCrossing(this.lastPosition.lng, currentLng, 30) ||
                this.detectLineCrossing(this.lastPosition.lat, currentLat, 30);
            
            const soundType = isMajorGrid ? 'majorGridCross' : 'gridCross';
            this.playSound(soundType);
            
            console.log(`Grid crossing detected: ${soundType} at ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`);
        }
        
        this.lastPosition = { lat: currentLat, lng: currentLng };
    }
    
    /**
     * Detect if a line crossing occurred
     * @param {number} oldValue - Previous coordinate value
     * @param {number} newValue - Current coordinate value
     * @param {number} spacing - Grid spacing in degrees
     * @returns {boolean} True if line was crossed
     */
    detectLineCrossing(oldValue, newValue, spacing) {
        // Handle longitude wrap-around at 180/-180
        if (Math.abs(newValue - oldValue) > 180) {
            if (newValue > oldValue) {
                oldValue += 360;
            } else {
                newValue += 360;
            }
        }
        
        const oldGrid = Math.floor(oldValue / spacing);
        const newGrid = Math.floor(newValue / spacing);
        
        return oldGrid !== newGrid;
    }
    
    /**
     * Play sound by type
     * @param {string} soundType - Type of sound to play
     */
    async playSound(soundType) {
        if (!this.isEnabled || this.isMuted) {
            return;
        }
        
        try {
            if (this.webAudioSupported) {
                await this.playWebAudioSound(soundType);
            } else if (this.html5AudioSupported) {
                await this.playHTML5Sound(soundType);
            }
        } catch (error) {
            console.error(`Failed to play ${soundType} sound:`, error);
        }
    }
    
    /**
     * Play sound using Web Audio API
     * @param {string} soundType - Type of sound to play
     */
    async playWebAudioSound(soundType) {
        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        const buffer = this.sounds.get(soundType);
        if (!buffer) {
            console.error(`Audio buffer not found for sound type: ${soundType}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gainNode);
        source.start();
    }
    
    /**
     * Play sound using HTML5 Audio (fallback)
     * @param {string} soundType - Type of sound to play
     */
    async playHTML5Sound(soundType) {
        // Generate simple beep for HTML5 Audio fallback
        const config = this.soundConfig[soundType];
        const frequency = config.frequencies[0]; // Use first frequency only
        const duration = config.duration * 1000; // Convert to milliseconds
        
        // Create a simple oscillator tone using data URL
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * config.duration);
        const buffer = new ArrayBuffer(samples * 2);
        const view = new DataView(buffer);
        
        for (let i = 0; i < samples; i++) {
            const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
            const envelope = this.calculateEnvelope(i, samples);
            const value = Math.floor(sample * envelope * 32767 * config.volume * this.volume);
            view.setInt16(i * 2, value, true);
        }
        
        // Convert to WAV format and play
        const wavBuffer = this.createWAVBuffer(buffer, sampleRate);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        audio.volume = this.volume;
        
        try {
            await audio.play();
            
            // Clean up after playing
            audio.onended = () => {
                URL.revokeObjectURL(url);
            };
        } catch (error) {
            console.error('Failed to play HTML5 audio:', error);
            URL.revokeObjectURL(url);
        }
    }
    
    /**
     * Create WAV file buffer from PCM data
     * @param {ArrayBuffer} pcmBuffer - PCM audio data
     * @param {number} sampleRate - Sample rate in Hz
     * @returns {ArrayBuffer} WAV file buffer
     */
    createWAVBuffer(pcmBuffer, sampleRate) {
        const length = pcmBuffer.byteLength;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Copy PCM data
        const pcmView = new DataView(pcmBuffer);
        for (let i = 0; i < length; i++) {
            view.setUint8(44 + i, pcmView.getUint8(i));
        }
        
        return buffer;
    }
    
    /**
     * Set volume level
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
        
        console.log(`Audio volume set to: ${(this.volume * 100).toFixed(0)}%`);
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        }
        
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
    }
    
    /**
     * Enable or disable audio system
     * @param {boolean} enabled - Whether to enable audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Play error sound
     */
    playErrorSound() {
        this.playSound('error');
    }
    
    /**
     * Get current audio status
     * @returns {Object} Audio status information
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isMuted: this.isMuted,
            volume: this.volume,
            webAudioSupported: this.webAudioSupported,
            html5AudioSupported: this.html5AudioSupported,
            audioContextState: this.audioContext ? this.audioContext.state : null,
            soundsLoaded: this.sounds.size
        };
    }
    
    /**
     * Test audio functionality
     */
    async testAudio() {
        console.log('Testing audio functionality...');
        
        await this.playSound('gridCross');
        
        setTimeout(async () => {
            await this.playSound('majorGridCross');
        }, 500);
        
        setTimeout(async () => {
            await this.playSound('error');
        }, 1000);
    }
    
    /**
     * Clean up audio resources
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds.clear();
        console.log('Audio Manager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}