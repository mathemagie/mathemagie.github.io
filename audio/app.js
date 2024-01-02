const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = ['output.mp3', 'background-music.mp3','https://audiod.s3.eu-west-3.amazonaws.com/19721-21.12.2022-ITEMA_23181447-2022F33264E0017-21.mp3'];

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