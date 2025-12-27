        // Morse Code Encoder Class
        class MorseCodeEncoder {
            constructor() {
                this.morseCode = {
                    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
                    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
                    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
                    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
                    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
                    'Z': '--..',
                    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
                    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
                    '.': '.-.-.-', '-': '-....-', ' ': '/'
                };
            }

            encode(text) {
                return text.toUpperCase().split('').map(char => {
                    return this.morseCode[char] || '';
                }).join(' ');
            }

            createVisualMorse(morseString, containerId) {
                const container = document.getElementById(containerId);
                if (!container) return;

                container.innerHTML = '';

                const symbols = morseString.split(' ');

                symbols.forEach((symbol, index) => {
                    if (symbol === '') return;

                    if (symbol === '/') {
                        // Word space
                        const space = document.createElement('div');
                        space.className = 'morse-letter-space';
                        container.appendChild(space);
                    } else {
                        // Individual Morse symbols
                        for (let i = 0; i < symbol.length; i++) {
                            const element = document.createElement('div');
                            if (symbol[i] === '.') {
                                element.className = 'morse-dot';
                            } else if (symbol[i] === '-') {
                                element.className = 'morse-dash';
                            }
                            container.appendChild(element);
                        }

                        // Letter space (except for last letter)
                        if (index < symbols.length - 1 && symbols[index + 1] !== '/') {
                            const space = document.createElement('div');
                            space.className = 'morse-space';
                            container.appendChild(space);
                        }
                    }
                });
            }
        }

        // ISS tracking application
        class ISSTracker {
            constructor() {
                this.apiUrl = 'http://api.open-notify.org/iss-now.json';
                this.updateInterval = 5000; // Update every 5 seconds
                this.previousPosition = null;
                this.intervalId = null;
                this.morseEncoder = new MorseCodeEncoder();
                this.morseMode = 'visual'; // Default to visual mode
                this.countryFlags = {
                    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪',
                    'IT': '🇮🇹', 'ES': '🇪🇸', 'RU': '🇷🇺', 'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷',
                    'AU': '🇦🇺', 'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'PE': '🇵🇪', 'CO': '🇨🇴',
                    'IN': '🇮🇳', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'TR': '🇹🇷',
                    'IR': '🇮🇷', 'SA': '🇸🇦', 'AE': '🇦🇪', 'IL': '🇮🇱', 'TH': '🇹🇭', 'VN': '🇻🇳',
                    'PH': '🇵🇭', 'MY': '🇲🇾', 'ID': '🇮🇩', 'NZ': '🇳🇿', 'NO': '🇳🇴', 'SE': '🇸🇪',
                    'FI': '🇫🇮', 'DK': '🇩🇰', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
                    'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 'GR': '🇬🇷',
                    'PT': '🇵🇹', 'IE': '🇮🇪', 'IS': '🇮🇸', 'PT': '🇵🇹'
                };

                this.init();
            }

            init() {
                this.updateISSPosition();
                this.intervalId = setInterval(() => {
                    this.updateISSPosition();
                }, this.updateInterval);
            }

            async updateISSPosition() {
                try {
                    this.updateStatus('loading', 'Fetching ISS position...');

                    const response = await fetch(this.apiUrl);
                    const data = await response.json();

                    if (data.message === 'success') {
                        const position = data.iss_position;
                        const timestamp = data.timestamp;

                        this.updateDisplay(position, timestamp);
                        this.updateStatus('success', 'ISS position updated successfully');
                    } else {
                        throw new Error('API returned unsuccessful response');
                    }
                } catch (error) {
                    console.error('Error fetching ISS position:', error);
                    this.updateStatus('error', 'Failed to fetch ISS position. Retrying...');
                }
            }

            updateDisplay(position, timestamp) {
                // Get coordinates for Morse code and country information
                const lat = parseFloat(position.latitude).toFixed(4);
                const lon = parseFloat(position.longitude).toFixed(4);

                // Update coordinates display for Morse code section
                document.getElementById('coordinates-display').textContent =
                    `Current Position: ${lat}°N, ${lon}°E`;

                // Fetch country information
                this.updateCountryInfo(lat, lon);

                // Update timestamp
                const date = new Date(timestamp * 1000);
                document.getElementById('last-updated').textContent =
                    `Last updated: ${date.toLocaleTimeString()}`;
            }

            updateMorseCode(countryName) {
                // Generate Morse code for country name or "International Waters"
                const countryMorse = this.morseEncoder.encode(countryName);

                // Update both visual and text displays
                this.updateMorseVisual(countryMorse);
                this.updateMorseText(countryMorse);

                // Update global Morse sequence for full-screen mode
                updateCurrentMorseSequence(countryMorse);
            }

            updateMorseVisual(countryMorse) {
                // Create visual Morse code display for country/location
                this.morseEncoder.createVisualMorse(countryMorse, 'country-morse');
            }

            updateMorseText(countryMorse) {
                // Display raw Morse code text
                const textElement = document.getElementById('country-morse-text');
                if (textElement) {
                    textElement.textContent = countryMorse;
                }
            }

            switchMorseMode(mode) {
                this.morseMode = mode;

                // Update button states
                const visualBtn = document.getElementById('visual-mode');
                const textBtn = document.getElementById('text-mode');

                if (mode === 'visual') {
                    visualBtn.classList.add('active');
                    textBtn.classList.remove('active');
                } else {
                    textBtn.classList.add('active');
                    visualBtn.classList.remove('active');
                }

                // Update display based on mode
                const morseContainer = document.getElementById('country-morse');
                const morseText = document.getElementById('country-morse-text');

                if (mode === 'visual') {
                    morseContainer.style.display = 'flex';
                    morseText.style.display = 'none';
                } else {
                    morseContainer.style.display = 'none';
                    morseText.style.display = 'block';
                }
            }


            async updateCountryInfo(latitude, longitude) {
                try {
                    const countryData = await this.getCountryFromCoordinates(latitude, longitude);

                    if (countryData) {
                        const flag = this.countryFlags[countryData.country_code] || '🏳️';
                        document.getElementById('country-flag').textContent = flag;
                        document.getElementById('country-name').textContent = countryData.display_name;
                        document.getElementById('ocean-status').textContent = '';
                        // Generate Morse code for country name
                        this.updateMorseCode(countryData.display_name);
                    } else {
                        // ISS is over ocean/international waters
                        document.getElementById('country-flag').textContent = '🌊';
                        document.getElementById('country-name').textContent = 'International Waters';
                        document.getElementById('ocean-status').textContent = 'ISS is currently over the ocean';
                        // Generate Morse code for "International Waters"
                        this.updateMorseCode('International Waters');
                    }
                } catch (error) {
                    console.error('Error fetching country information:', error);
                    document.getElementById('country-flag').textContent = '❓';
                    document.getElementById('country-name').textContent = 'Unable to determine location';
                    document.getElementById('ocean-status').textContent = 'Location detection failed';
                    // Generate Morse code for error message
                    this.updateMorseCode('Unable to determine location');
                }
            }

            async getCountryFromCoordinates(latitude, longitude) {
                try {
                    // Using Nominatim API for reverse geocoding (free, no API key required)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'ISS-Tracker/1.0 (educational project)'
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data && data.address && data.address.country) {
                        return {
                            country: data.address.country,
                            country_code: data.address.country_code?.toUpperCase() || '',
                            display_name: data.display_name.split(',')[0] || data.address.country
                        };
                    }

                    return null; // No country found (over ocean)

                } catch (error) {
                    console.error('Error in reverse geocoding:', error);
                    throw error;
                }
            }


            updateStatus(type, message) {
                const statusElement = document.getElementById('status');
                statusElement.className = `status ${type}`;
                statusElement.innerHTML = message;
            }

            destroy() {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
            }
        }

        // Global reference to the ISS tracker instance
        let issTracker = null;

        // Full-screen Morse code variables
        let fullscreenActive = false;
        let blinkInterval = null;
        let currentMorseSequence = '';
        let currentSequenceIndex = 0;

        // Function to switch Morse code display mode
        function switchMorseMode(mode) {
            if (issTracker) {
                issTracker.switchMorseMode(mode);
            }
        }

        // Function to enter full-screen Morse code mode
        function enterFullscreenMorse() {
            const overlay = document.getElementById('fullscreen-morse');
            if (overlay) {
                overlay.classList.add('active');
                fullscreenActive = true;

                // Update full-screen display with current data
                updateFullscreenDisplay();

                // Start blinking sequence if we have Morse code
                if (currentMorseSequence) {
                    startBlinkingSequence();
                }

                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
            }
        }

        // Function to exit full-screen Morse code mode
        function exitFullscreenMorse() {
            const overlay = document.getElementById('fullscreen-morse');
            if (overlay) {
                overlay.classList.remove('active');
                fullscreenActive = false;

                // Stop blinking sequence
                stopBlinkingSequence();

                // Restore body scrolling
                document.body.style.overflow = 'auto';
            }
        }

        // Function to update full-screen display
        function updateFullscreenDisplay() {
            if (!fullscreenActive) return;

            // Update location
            const locationElement = document.getElementById('fullscreen-location');
            if (locationElement && issTracker) {
                const countryElement = document.getElementById('country-name');
                if (countryElement) {
                    locationElement.textContent = `Location: ${countryElement.textContent}`;
                }
            }

            // Update Morse sequence display
            const sequenceElement = document.getElementById('morse-sequence');
            if (sequenceElement && currentMorseSequence) {
                sequenceElement.textContent = currentMorseSequence;
            }
        }

        // Function to start the blinking sequence
        function startBlinkingSequence() {
            if (!currentMorseSequence || currentMorseSequence.trim() === '') {
                return;
            }

            stopBlinkingSequence(); // Stop any existing sequence

            currentSequenceIndex = 0;
            const morseLight = document.getElementById('morse-light');
            const sequence = currentMorseSequence.replace(/\s+/g, ''); // Remove spaces for blinking

            if (!morseLight || sequence.length === 0) return;

            blinkInterval = setInterval(() => {
                if (currentSequenceIndex >= sequence.length) {
                    // Sequence complete, wait before restarting
                    morseLight.classList.remove('active');
                    setTimeout(() => {
                        currentSequenceIndex = 0;
                    }, 2000); // 2 second pause before restart
                    return;
                }

                const symbol = sequence[currentSequenceIndex];

                if (symbol === '.') {
                    // Dot: short blink (200ms)
                    morseLight.classList.add('active');
                    setTimeout(() => {
                        morseLight.classList.remove('active');
                    }, 200);
                } else if (symbol === '-') {
                    // Dash: long blink (600ms)
                    morseLight.classList.add('active');
                    setTimeout(() => {
                        morseLight.classList.remove('active');
                    }, 600);
                } else if (symbol === '/') {
                    // Word space: pause (1400ms)
                    morseLight.classList.remove('active');
                    setTimeout(() => {
                        // Continue to next symbol
                    }, 1400);
                }

                currentSequenceIndex++;
            }, 800); // Base timing between symbols
        }

        // Function to stop the blinking sequence
        function stopBlinkingSequence() {
            if (blinkInterval) {
                clearInterval(blinkInterval);
                blinkInterval = null;
            }

            // Turn off the light
            const morseLight = document.getElementById('morse-light');
            if (morseLight) {
                morseLight.classList.remove('active');
            }
        }

        // Function to update current Morse sequence (called from ISSTracker)
        function updateCurrentMorseSequence(sequence) {
            currentMorseSequence = sequence;

            if (fullscreenActive) {
                updateFullscreenDisplay();
                startBlinkingSequence();
            }
        }

        // Initialize the ISS tracker when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            issTracker = new ISSTracker();

            // Set initial Morse mode display
            issTracker.switchMorseMode('visual');

            // Add keyboard event listener for full-screen mode
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && fullscreenActive) {
                    exitFullscreenMorse();
                } else if (event.key === 'F' && event.ctrlKey && !fullscreenActive) {
                    event.preventDefault();
                    enterFullscreenMorse();
                }
            });

            // Clean up when the page is unloaded
            window.addEventListener('beforeunload', () => {
                if (issTracker) {
                    issTracker.destroy();
                }
                stopBlinkingSequence();
            });
        });

        // Error handling for the entire application
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
