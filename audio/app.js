const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = [];

function loadTracksFromJson(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            tracks.push(...data.tracks);
        })
        .catch(error => {
            console.error('Error loading tracks:', error);
        });
}

loadTracksFromJson('tracks.json');
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
    console.log(tracks[trackIndex] + ' is playing');
    audioPlayer.src = tracks[trackIndex];
    audioPlayer.play();
}