var socket = io();
var gameState = "room"; //determine the listUI elements
var listUI = []; //reset every change in gameState

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var startX = 0;
var startY = 0;
var canvasW = 800;
var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;

window.addEventListener('click', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
  console.log("x: " + e.pageX + ", y: " + e.pageY);
  processClick(mouseX, mouseY);
});

updateRoom("something");/// temporary

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
  //temporary hardcoded for testing
  console.log("empty listUI: " + listUI)
  var player1 = new PlayerBox("shisata", 100, 100, 300, 300, 'red');
  var player2 = new PlayerBox("satoshi", 400, 100, 300, 300, 'black');
  var ready = new Ready(400, 400, 100, 100, 'red');
  listUI.push(player1);
  listUI.push(player2);
  listUI.push(ready);
  console.log(listUI[0])
  console.log(listUI[1])
  console.log(listUI[2])
  //hardcoded for testing
}

function updateRoomDrawing(){
  for (var i = 0; i < listUI.length; i++) {
    var element = listUI[i];
    // if(element.name == something that is from room)
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
  context.fillStyle = "white"; ///temp hardcoded
  context.fillText(element.name, element.x + (element.width / 2), element.y + (element.height / 2));
}

//process if clicked on an UI element
function processClick(mouseX, mouseY){
  var index = giveIndexCLickableUI(mouseX, mouseY);
  // console.log(this.listUI[0]);
  if(index != -1){
    console.log("Found clickable index: " + index)
    this.listUI[index].interaction();
  }else if(index == -1){
    console.log("No clickable")
  }else{
    console.log("Error finding element. Index: " + index)
  }
}

//find index of a clickable UI element, return -1 if none
function giveIndexCLickableUI(mouseX, mouseY){
  for(var i = 0; i < listUI.length; i++){
    if(hasClickableUI(mouseX, mouseY, listUI[i])){
      return i;
    }
  }
  return -1;
}


//search UI element with a simple array because there aren't many elements -> wont impact performance much
function hasClickableUI(mouseX, mouseY, element){
  if(mouseX >= element.x && mouseY >= element.y){
    if(mouseX <= (element.x + element.width) && mouseY < (element.y + element.height)){
      if(element.clickable == true){
        return true;
      }else if(element.clickable == undefined || element.clickable == null){
        console.log("Error in clickable element: " + element);
      }
    }
  }
  return false;
}


//gameState used to know whether game is in main menu or in-game
function hasUIElement(x, y){

  console.log("wrong gameState");
  return false;
}
