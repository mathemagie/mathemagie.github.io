const audioPlayer = document.getElementById('audioPlayer');
let trackIndex = 0;
const tracks = ['output.mp3', 'background-music.mp3','https://audio-fabrizio.s3.eu-west-3.amazonaws.com/_Alzarus_et_le_ba%CC%82ton_de_pluie_.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMyJGMEQCICWxzxpQByv%2FDEXv7d4EfqkYj%2Bhrk1c%2BDTwfvzmIH9quAiB9t0VaG4SdjzTAW%2B%2BCD%2FZ%2FDrUSQDrnMKNYu%2FZ3O%2BXmFyroAghEEAMaDDY1MzAwNjAzMjY4MCIMmrNctXyhugfA3pgOKsUCWj7dh6ZhwdP9wzqk5FmdNh7hTwxsiI%2F7HDprdZMwwXt3sOYJSqMtzkqjwtSXR67aPWjdhM92kjTIC0RUAaioXkQGgtRNKqTLui%2BKKr2ICNjdDQOBf6rtIwVmqlMevzE0wsfeTUlIOq7kfIyK7beO7UVahhY3%2Fozlz9RJMEOAg4WUlI%2BkbrMmW8tug5FcVYmgRzWbg1n0%2Bbw3F2zqVnBs59%2B1SZPYgcuJVDiDhbXj1PMN2mDo3s%2FJeudMJta7VGLo63Vb3v8xn%2FHeZrS7Bkpl%2FDDyuYEcis2uDGE1QM%2Bxdrd9UJu30Tr%2BLIAusLrmO%2BM%2Fm5MLOS%2B1hfAAVC4HCCDWb2ajbrluist7PvUWuSOVKPxby27Kwczytg6jEiWrusCjRBTfpHFasz%2B3G53Rs1JtgzhZc1f7k2Y4%2FWe7chxwZ4pUqv1F9zD6yM%2BsBjq0Auo7HzVx6ZcMpU%2FlZDJ0E5OXgTDYA74MJFZSurWLEqJu%2BReWK7Sv3EQ9tDjj7PgWk4MukpUVbgcEaY3rdie%2FSbjNOreodlnbM0B6gCSpCi%2BSNKBlRJVBFrPnAw15O6V9Dr9PV8nibNXnDCWTwpIPipOX2%2F9Mi4ztzCsoDA%2BkpNCqTXebyTX2bzDhMSVZcexONXOa8kKW6sNQ%2FGz2aYrcYbIzpSvB04fyQlAJ8FDNctTQdN8GH0gbL3tFqTOoboW%2BRFyeRb2Du3Q2WE296Mli6LKZudQ%2FxXnTpDaEiuXqZ%2BnCrnOyUjaBFEuShnspKKARHILMDX5%2BeRlELVTjVKsZ05osoWEhHkVy4wjbnJM8Z%2Bv92t42SGnVFYHgB3rDMljHVCTzggluyWnvi6IAY7uFx8m7cB%2FL&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240102T104925Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZQCRRJ4UKXGIJ3EZ%2F20240102%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Signature=7f45739e1649ec6062f5c64e160453c0df890332b238002ebe98d1f52fc6941a'];

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