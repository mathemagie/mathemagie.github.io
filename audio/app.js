const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = [];

const urls3Amazon = 'https://audiod.s3.eu-west-3.amazonaws.com/';

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

//create random track function to pick random track from array tracks
function randomTrack() {
    trackIndex = Math.floor(Math.random() * tracks.length);
    console.log(trackIndex);
    playTrack();
}

function playTrack() {
    console.log(tracks[trackIndex] + ' is playing');
    audioPlayer.src = urls3Amazon + tracks[trackIndex];
    var currentTrack = tracks[trackIndex];
    var trackDiv = document.getElementById("currentTrack");
    trackDiv.textContent = currentTrack;
    audioPlayer.play();
}