
var socket = io();
var menuUIs = [];
var gameUIs = [];

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var startX = 0;
var startY = 0;
var canvasW = 800;
var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;

window.addEventListener('mousemove', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
  processClick(mouseX, mouseY);
});

updateRoom("something");
socket.on('main menu', function(){

  socket.on('lobby', function(data){
    updateRoom(data);
  });

  socket.on('global', function(data){
    updateGlobal(data);
  });
});

socket.on('start game', function(){
  gameLoop();
});

//update lobby UI menu
function updateRoom(data){
  updateRoomData();
  updateRoomDrawing();
}
//update global players and rooms UI menu
function updateGlobal(data){
  updateGlobalData();
  updateGlobalDrawing();
}

function gameLoop(){

}

///// Support functions
function updateRoomData(data){
  //hardcoded for
  var player1 = new PlayerBox("shisata", 100, 100, 300, 300, 'red');
  var player2 = new PlayerBox("satoshi", 400, 100, 300, 300, 'black');
  var ready = new Ready(400, 400, 100, 100, 'red');
  menuUIs.push(player1);
  menuUIs.push(player2);
  menuUIs.push(ready);
}

function updateRoomDrawing(){
  for (var i = 0; i < menuUIs.length; i++) {
    var element = menuUIs[i];
    drawUIElement(element)
  }
}

function updateGlobalData(){

}

function updateGlobalDrawing(){

}

//input orignal canvas size and desired position based on canavs scaling to get actual position
//used for scaling
//ex: want to get position x = 50% of canvas width
function giveOnCanvasPos(size, percent){
  return position = size * (percent / 100);
}

//input position percentage of width, height of canvas to initialize element
function initElement(percentX, percentY){
  // console.log("interaction function")
  // var x = 10;
  // var hasTexture = false;
  // var src = null;
  // var color = 'red';
  // var text = 'Int';
  // var clickable = true
  // var element = new Ready(x, x, x, x, hasTexture, src, color, text, clickable);
  // console.log(element);
}

//read and draw UIElement onto canvas
function drawUIElement(element){
  context.font = "30px Verdana";
  context.fillStyle = element.color;
  context.beginPath();
  context.rect(element.x, element.y, element.width, element.height);
  context.fill();
  context.fillStyle = "#CCCCCC"; ///hardcoded
  context.fillText(element.name, element.x + (element.width / 2), element.y + (element.height / 2));
}

//process if clicked on an UI element
function processClick(mouseX, mouseY){
  
}

//gameState used to know whether game is in main menu or in-game
//search UI element with a simple array because there aren't many elements -> wont impact performance much
function hasUIElement(x, y, gameState){
  if(gameState == "room"){
    return hasMenuUI(x, y);
  }else if(gameState == "game"){
    return hasGameUI(x, y);
  }
  console.log("wrong gameState");
  return false;
}

function hasMenuUI(x, y){
  for (var i = 0; i < menuUIs.length; i++){
    var rangeX = x - menuUIs[i].x;
    var rangeY = y - menuUIs[i].y;
    if(rangeX <= menuUIs[i].x && rangeY <= menuUIs[i].y){
      return true;
    }
  }
  return false;
}

function hasGameUI(x, y){
  for (var i = 0; i < menuUIs.length; i++){
    var rangeX = x - gameUIs[i].x;
    var rangeY = y - gameUIs[i].y;
    if(rangeX <= gameUIs.x && rangeY <= gameUIs.y){
      return true;
    }
  }
  return false;
}
