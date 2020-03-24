var socket;
var otherMouseX = 100;
var otherMouseY = 100;

function setup() {
  createCanvas(500, 500);
  frameRate(20);
  background(51);
  socket = io();
  socket.on('mouse', (data) => {
    otherMouseX = data.x;
    otherMouseY = data.y;
  });
}

function mouseMoved() {
  const data = {
    x: mouseX,
    y: mouseY
  }
  socket.emit('mouse', data);
}

function draw() {
  background(51);
  rect(mouseX, mouseY, 50, 50);
  rect(otherMouseX, otherMouseY, 50, 50);
}
