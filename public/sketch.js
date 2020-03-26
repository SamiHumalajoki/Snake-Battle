var socket;
var otherX;
var otherY;
var vx = 1;
var vy = 0;
var blockSize = 10;
var x;
var y;

function setup() {
  createCanvas(500, 500);
  frameRate(10);
  background(51);
  x = round(random(100,400));
  y = round(random(100,400));
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
  socket.emit('move', {x:x, y: y});
  rect(x, y, blockSize, blockSize);
  if(otherX) {
    rect(otherX, otherY, blockSize, blockSize);
  }
}
