var socket;
var otherX = 100;
var otherY = 100;
var vx = -1;
var vy = 0;
var blockSize = 20;
var x = 400;
var y = 400;

function setup() {
  createCanvas(500, 500);
  frameRate(10);
  background(51);
  socket = io();
  socket.on('move', (data) => {
    otherX = data.x;
    otherY = data.y;
  });
}

function keyPressed() {
  console.log(keyCode);
  if (keyCode == LEFT_ARROW) {
    vx = -1;
    vy = 0;
  }
  if (keyCode == RIGHT_ARROW) {
    vx = 1;
    vy = 0;
  }
  if (keyCode == UP_ARROW) {
    vx = 0;
    vy = -1;
  }
  if (keyCode == DOWN_ARROW) {
    vx = 0;
    vy = 1;
  }
}

/*
function touchMoved() {
  const data = {
    x: mouseX,
    y: mouseY
  }
  socket.emit('mouse', data);
}
*/

function draw() {
  //background(51);
  x += vx * blockSize;
  y += vy * blockSize;
  socket.emit('move', data);
  rect(x, y, 20, 20);
  rect(otherX, otherY, 20, 20);
}
