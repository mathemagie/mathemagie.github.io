let issPosition = { latitude: 0, longitude: 0 };
let loaded = false;
function setup() {
  // Wait for the map image to load before initializing the canvas overlay
  const imgElem = document.getElementById('map');
  if (!imgElem.complete) {
    imgElem.onload = () => initCanvas(imgElem);
  } else {
    initCanvas(imgElem);
  }
}
function draw() {
  clear();
  if (!loaded) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Loading ISS data...', width / 2, height / 2);
    return;
  }
  drawISS();
  drawInfo();
}
// Initialize canvas overlay once the map image dimensions are known
function initCanvas(imgElem) {
  const w = imgElem.clientWidth;
  const h = imgElem.clientHeight;
  const canvas = createCanvas(w, h);
  canvas.parent('canvas-container');
  fetchISS();
  setInterval(fetchISS, 1000);
}
// Poll the ISS API every second
function fetchISS() {
  loadJSON('https://api.wheretheiss.at/v1/satellites/25544', (data) => {
    issPosition.latitude = data.latitude;
    issPosition.longitude = data.longitude;
    loaded = true;
  });
}
function drawISS() {
  const x = map(issPosition.longitude, -180, 180, 0, width);
  const y = map(issPosition.latitude, 90, -90, 0, height);
  fill(255, 0, 0);
  stroke(0);
  ellipse(x, y, 10, 10);
}
function drawInfo() {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, BASELINE);
  const lat = issPosition.latitude.toFixed(2);
  const lon = issPosition.longitude.toFixed(2);
  text(`Latitude: ${lat}`, 10, height - 20);
  text(`Longitude: ${lon}`, 10, height - 5);
}