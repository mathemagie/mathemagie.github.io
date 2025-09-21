const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = [];

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
            console.log('Tracks shuffled on load:', tracks.length, 'tracks');
        })
        .catch(error => {
            console.error('Error loading tracks:', error);
        });
}

loadTracksFromJson('tracks.json?random=' + Math.random());
function prevTrack() {
    trackIndex--;
    if (trackIndex < 0) {
        trackIndex = tracks.length - 1;
    }
    playTrack();
}

function nextTrack() {
    trackIndex++;
    if (trackIndex >= tracks.length) {
        trackIndex = 0;
    }
    playTrack();
}


function playTrack() {
    var currentTrack = tracks[trackIndex];
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