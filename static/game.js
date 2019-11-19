var socket = io();
var gameState = "menu"; //determine the listUI elements
var listUI = []; //reset every change in gameState
var totalPlayers;
var globalPlayers = [];
var rooms;

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var canvasStartX = 0;
var canvasStartY = 0;
var canvasW = 800;
var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;

window.addEventListener('click', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
  //only process when click is inside canvas
  if(mouseX >= canvasStartX && mouseY >= canvasStartY){
    if(mouseX <= canvasW && mouseY <= canvasH){
      console.log("x: " + e.pageX + ", y: " + e.pageY);
      processClick(mouseX, mouseY);
    }
  }
});

generalProcessor();

function generalProcessor(){
  if(gameState == "menu"){
    menuProcessor();
  }else if(gameState == "game"){
    gameProcessor();
  }
}

function menuProcessor(){
  socket.on('main menu', function(){
    console.log("socket.id = " + socket.id)//temporary
    console.log("main menu called");////temporary
    // this.gameState = "menu";
    initBasicMenuUI()
    socket.on('global', function(globalData){
      updateGlobal(globalData);
    });
    socket.on('room data', function(room){
      updateRoom(room);
      removeCreateRoomUI();
    });
    updateUIDrawing();
  });
}

function gameProcessor(){
  socket.on('starting game', function(){
    // socket.emit
  })
  socket.on('in game',function(data){
    listUI = {};
    // this.gameState = "game";
    console.log("in game called");
  });
}


/////////////////////// Support functions

//create basic UI such as create room, search,etc..
function initBasicMenuUI(){
  var createRoom = new CreateRoom(5, 350, 200, 50, "black", this.socket);
  listUI.push(createRoom);
}

//update room UI menu
function updateGlobal(globalData){
  console.log("global called")
  console.log("\tdata: " + globalData);
  updateGlobalData(globalData);
  updateUIDrawing();
}

function updateRoom(room){
  console.log("room called")
  console.log(socket.id)
  for(var player in room.players){
    console.log("\tplayer " + player)
  }
  console.log("projectiles" + room.projectiles)
  console.log("bulletCount " + room.bulletCount)
  console.log("enemies " + room.enemies)
  console.log("enemyID " + room.enemyID)
  console.log("mapImageSrc " + room.mapImageSrc)
  console.log("mapData " + room.mapData)
  console.log("lastSpawn " + room.lastSpawn)
  console.log("spawnRate " + room.spawnRate)
  updateRoomData(room);
  updateUIDrawing();
}
//update global players and rooms UI menu


function updateGlobalData(globalData){
  removeOldGlobalData();
  initGlobalData(globalData);
}

function removeOldGlobalData(){
  // var elementName = 'Global Player'
  console.log("rremoveOldGlobalData")
  console.log("\tlistUI: " + listUI)
  // listUI = listUI.filter();
  console.log("\tlistUI: " + listUI)
}

function initGlobalData(globalData){
  var x = 5;
  var y = 400;
  var width = 20;
  var height = 20;
  for(var playerID in globalData.globalPlayers.players){
    var player = new GlobalPlayer(playerID, x, y, width, height, 'blue');
    console.log(player);
    listUI.push(player);
    x += width * 2;
    if(x >= canvasW){
      x = 5;
      y += height * 2;
    }
  }
}

function updateRoomData(room){
  var x = 5;
  var y = 10;
  var width = 50;
  var height = 100;
  for(var playerID in room.players){
    var player = new Teammate(playerID, x, y, width, height, 'blue');
    console.log(player);
    listUI.push(player);
    x += width * 2;
    if(x >= canvasW){
      x = 5;
      y += height * 2;
    }
  }
  var element = new Ready(350, 350, 50, 50, "purple");
  listUI.push(element);
}

function updateUIDrawing(){
  for (var i = 0; i < listUI.length; i++) {
    var element = listUI[i];
    // if(element.name == something that is from room)
    drawUIElement(element)
  }
}

function removeCreateRoomUI(){

}

function gameLoop(){

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
  context.font = "10px Arial";
  context.fillStyle = element.color;
  context.beginPath();
  context.rect(element.x, element.y, element.width, element.height);
  context.fill();
  context.fillStyle = "white"; ///temp hardcoded
  var text = element.name;
  context.fillText(text, element.x + 5, element.y + 5);
}

function giveElementText(element){
  if(element.name == "Global Player" || element.name == "Teammate"){
    return element.userName;
  }
  return element.name;
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

//
// //gameState used to know whether game is in main menu or in-game
// function hasUIElement(x, y){
//
//   console.log("wrong gameState");
//   return false;
// }
