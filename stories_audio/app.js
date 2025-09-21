const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = [];
let filteredTracks = []; // Tracks after filtering
let currentFilter = 'all'; // Current filter type
let currentSearch = ''; // Current search text

const urls3Amazon = 'https://audiod.s3.eu-west-3.amazonaws.com/';

// Fisher-Yates shuffle algorithm to randomize array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadTracksFromJson(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            tracks.push(...data.tracks);
            // Shuffle tracks after loading for random playback order
            shuffleArray(tracks);
            // Initialize filtered tracks (start with all tracks)
            filteredTracks = [...tracks];
            updateTrackCount();
            generateThematiqueButtons(); // Generate thematique buttons dynamically
            setupFilters();
            updateButtonStates(); // Update button visibility after loading tracks
            console.log('Tracks loaded and shuffled:', tracks.length, 'tracks');
        })
        .catch(error => {
            console.error('Error loading tracks:', error);
        });
}

loadTracksFromJson('tracks.json?random=' + Math.random());

// Thematique mapping for user-friendly names and emojis
const thematiqueConfig = {
    'thematique:oli': { name: 'Oli', emoji: '🦉' },
    'thematique:les_explorateurs_de_l_univers': { name: 'Explorateurs', emoji: '🚀' },
    'thematique:les_odyssées': { name: 'Odyssées', emoji: '⚓' }
};

// Extract unique thematiques from tracks
function extractThematiques() {
    const thematiques = new Set();

    tracks.forEach(track => {
        if (track.tags) {
            track.tags.forEach(tag => {
                if (tag.startsWith('thematique:')) {
                    thematiques.add(tag);
                }
            });
        }
    });

    return Array.from(thematiques).sort();
}

// Generate thematique filter buttons dynamically
function generateThematiqueButtons() {
    const thematiques = extractThematiques();
    const filterButtonsContainer = document.querySelector('.filter-buttons');

    // Remove existing thematique buttons (if any)
    const existingThematiqueButtons = filterButtonsContainer.querySelectorAll('[data-filter^="thematique:"]');
    existingThematiqueButtons.forEach(button => button.remove());

    // Add new thematique buttons before the closing div
    thematiques.forEach(thematique => {
        const config = thematiqueConfig[thematique] || {
            name: thematique.replace('thematique:', '').replace(/_/g, ' '),
            emoji: '📚'
        };

        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', thematique);
        button.innerHTML = `${config.emoji} ${config.name}`;

        // Insert before the closing div tag
        filterButtonsContainer.appendChild(button);
    });

    // Re-setup event listeners for all buttons including the new ones
    setupFilters();
}

// Filter and search functions
function setupFilters() {
    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentFilter = filterType;
            applyFilters();
        });
    });

    // Setup search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        applyFilters();
    });
}

function applyFilters() {
    let filtered = [...tracks];

    // Apply tag filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(track => {
            if (!track.tags) return false;

            // Handle thematique filters specially
            if (currentFilter.startsWith('thematique:')) {
                return track.tags.includes(currentFilter);
            }

            // For other filters, check if tag is present
            return track.tags.includes(currentFilter);
        });
    }

    // Apply search filter
    if (currentSearch) {
        filtered = filtered.filter(track => {
            const title = (track.title || '').toLowerCase();
            const tags = (track.tags || []).join(' ').toLowerCase();
            return title.includes(currentSearch) || tags.includes(currentSearch);
        });
    }

    // Shuffle the filtered results for random playback
    shuffleArray(filtered);
    filteredTracks = filtered;
    updateTrackCount();

    // Reset to first track if current track is out of bounds
    if (trackIndex >= filteredTracks.length) {
        trackIndex = 0;
    }

    console.log(`Filtered to ${filteredTracks.length} tracks (filter: ${currentFilter}, search: "${currentSearch}")`);
}

function updateTrackCount() {
    const countElement = document.getElementById('trackCount');
    const count = filteredTracks.length;
    const total = tracks.length;

    if (count === total) {
        countElement.textContent = `${total} histoires à écouter`;
    } else {
        countElement.textContent = `${count} histoires trouvées`;
    }

    updateButtonStates();
}

function updateButtonStates() {
    const prevButton = document.querySelector('.prev-btn');

    // Hide previous button if on first track or no tracks available
    if (trackIndex === 0 || filteredTracks.length === 0) {
        prevButton.style.display = 'none';
    } else {
        prevButton.style.display = 'flex';
    }
}

function prevTrack() {
    trackIndex--;
    if (trackIndex < 0) {
        trackIndex = filteredTracks.length - 1;
    }
    playTrack();
    updateButtonStates();
}

function nextTrack() {
    trackIndex++;
    if (trackIndex >= filteredTracks.length) {
        trackIndex = 0;
    }
    playTrack();
    updateButtonStates();
}


function playTrack() {
    if (filteredTracks.length === 0) {
        console.log('No tracks available with current filters');
        return;
    }

    var currentTrack = filteredTracks[trackIndex];
    console.log(currentTrack.title + ' is playing');

    // Check if the track URL already begins with "http"
    if (currentTrack.url.startsWith('http')) {
        // Use the full URL as-is (don't add urls3Amazon)
        audioPlayer.src = currentTrack.url;
    } else {
        // Add the S3 Amazon URL prefix for local tracks
        audioPlayer.src = urls3Amazon + currentTrack.url;
    }

    var trackDiv = document.getElementById("currentTrack");
    trackDiv.textContent = currentTrack.title;
    audioPlayer.play();
}