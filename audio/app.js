const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = ['output.mp3', 'background-music.mp3'];

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
    audioPlayer.src = tracks[trackIndex];
    audioPlayer.play();
}