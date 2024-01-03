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
    console.log(tracks[trackIndex] + ' is playing');
    audioPlayer.src = tracks[trackIndex];
    var currentTrack = tracks[trackIndex].replace("https://audiod.s3.eu-west-3.amazonaws.com/", "");
    var trackDiv = document.getElementById("currentTrack");
    trackDiv.textContent = "Currently playing: " + currentTrack;
    audioPlayer.play();
}