var socket = io();
var gameState = "menu"; //determine the listUI elements
var listUI = []; //reset every change in gameState
var totalPlayers;
var globalPlayers = [];
var rooms;
var roomData;
// var myId = "";
var audioList = {};

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var mapImage = new Image();
mapImage.src = "";
var mapImageLoaded = false;
var GRID_SIZE;
var canvasStartX = 0;
var canvasStartY = 0;
var canvasW = 800;
var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;

var mouseX = 0;
var mouseY = 0;

var globalDisplayArea = {
  startX : canvasStartX + 5,
  startY : canvasStartY + 400,
  endX : canvasW,
  endY : canvasH,
}

var roomDisplayArea = {
  startX : canvasStartX + 5,
  startY : canvasStartY + 10,
  endX : canvasW,
  endY : canvasStartY + 150,
}


var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
}
var shoot = {
    shootBullet: false,
    x: 0,
    y: 0,
    middleX: 0,
    middleY: 0
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
    case 32: // ' '
      shoot.shootBullet = true;
      shoot.x = mouseX;
      shoot.y = mouseY;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 32: // ' '
      shoot.shootBullet = false;
      shoot.x = mouseX;
      shoot.y = mouseY;
      break;
  }
});

document.addEventListener('click', function (e) {
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

window.addEventListener('mousemove', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
});

generalProcessor();

function generalProcessor(){
  socket.on('main menu', function(){
    clientMenuProcessor();
  });
  socket.on('in game',function(){//added roomData, concertn for inconsistency
    clientGameProcessor();
  });
}

function clientMenuProcessor(){
  console.log("socket.id = " + socket.id)//temporary
  console.log("main menu called");////temporary
  this.gameState = "menu";
  initBasicMenuUI()
  socket.on('global data', function(totalPlayers, globalPlayers){
    console.log("update global data called")
    // this.totalPlayers = totalPlayers;
    // this.globalPlayers = globalPlayers;]
    console.log("\ttotalPlayers received:", totalPlayers)
    console.log("\tglobalPlayers received:", globalPlayers)
    updateGlobal(globalPlayers);
  });
  socket.on('room data', function(room){
    if(room == "Room has already been taken"){
      alert("Room has already been taken");
    }else if(room == "Room does not exist"){
      alert("Room does not exist");
    }else if(room == "Room currently in game"){
      alert("Room currently in game");
    }else{
      console.log("received room data:", room)
      updateRoom(room);
    }
  });
  // updateUIDrawing();
  // setTimeout(function(){
  //     context.clearRect(globalDisplayArea.startX, globalDisplayArea.startY, globalDisplayArea.endX, globalDisplayArea.endY);
  //   setTimeout(function(){
  //     updateUIDrawing();
  //     console.log("listUI",listUI)
  //   }, 2000)
  // }, 2000)
}

function clientGameProcessor(){

  console.log("in game called");
  // if (myId == "") {
  //   socket.emit('requestPassId');
  //   socket.on("passId", function(socketID){
  //     myId = socketID;
  //   })
  // }
  socket.on('refresh data', function(){
    this.gameState = "game";
    listUI = {};
    updateUIDrawing();
  });

  socket.emit('owner process map')
  socket.on("grid size", function(size){
    console.log("received GRID_SIZE",GRID_SIZE)
    GRID_SIZE = size
    console.log("GRID_SIZE = " + size)
  });
  socket.on('draw map', function(mapData){
    console.log("draw map called")
    processMapDrawing(mapData);
  });// last change: only room owner deliver mapImage, other will receieve mapImage from server
  socket.on('map request', function(){
    requestMapImageFromServer(socket);
  });
  socket.emit('character creation')
  // socket.on('game loop', function(){
    socket.on('state', function(players, projectiles, enemies) {
      // for(var player in players){
      //   // console.log("player: " + player)
      // }
      // console.log("myID: " + myId)
      gameStateProcessor(players, projectiles, enemies)
    });
    playerInput();
  // })

}

/////////////////////// Support functions

//create basic UI such as create room, search,etc..
function initBasicMenuUI(){
  var createRoom = new CreateRoom(5, 350, 200, 50, "black", socket);
  listUI.push(createRoom);
}

//update room UI menu
function updateGlobal(globalPlayers){
  console.log("updateGlobal")
  console.log("\tglobalPlayers",globalPlayers)
  // for(var l = 0; l < globalPlayers.length; l++){
  //   console.log("\tglobalData[",l,"]",globalData[l]);
  //   for(var i = 0; i < globalData[l].length; i++){
  //     console.log("\t\tglobalData[",l, "][",i,"] ", globalData[i]);
  //   }
  // }

  updateGlobalData(globalPlayers);
  clearMenu(globalDisplayArea);
  // clearScreen(context);
  updateUIDrawing();
}

function updateRoom(room){
  // console.log("room called")
  // console.log(socket.id)
  // for(var player in room.players){
  //   console.log("\tplayer " + player)
  // }
  // console.log("projefctiles" + room.projectiles)
  // console.log("bulletCount " + room.bulletCount)
  // console.log("enemies " + room.enemies)
  // console.log("enemyID " + room.enemyID)
  // console.log("mapImageSrc " + room.mapImageSrc)
  // console.log("mapData " + room.mapData)
  // console.log("lastSpawn " + room.lastSpawn)
  // console.log("spawnRate " + room.spawnRate)
  updateRoomData(room);
  removeUIElements("Create Room")
  console.log("listUI after remove Create Room ",listUI)//last change: try to refresh createRoom button
  clearMenu(roomDisplayArea)
  context.clearRect(5, 350, 200, 50)
  updateUIDrawing();
}
//update global players and rooms UI menu


function updateGlobalData(globalPlayers){
  removeUIElements("Global Player")
  initGlobalData(globalPlayers);
}

function removeUIElements(name){
  for(var i = 0; i < listUI.length; i++){
    if(listUI[i].name == name){
      listUI.splice(i, 1);
      i--
    }
  }
}

// function removeOldGlobalData(){
//   // var elementName = 'Global Player'
//   console.log("rremoveOldGlobalData")
//   console.log("\tlistUI before remove old data: ")
//   for(var ui in listUI){
//     console.log("\t",ui);
//   }
//   for(var i = 0; i < listUI.length; i++){
//     if(listUI[i].name == "Global Player"){
//       listUI.splice(i, 1);
//       i--;
//     }
//   }
//   // listUI = listUI.filter();
//   console.log("\tlistUI after remove old data: ")
//   for(var ui in listUI){
//     console.log("\t",ui);
//   }
// }

function initGlobalData(globalPlayers){
  var x = globalDisplayArea.startX;
  var y = globalDisplayArea.startY;
  var width = 40;
  var height = 40;
  console.log("\tglobalPlayers",globalPlayers)
  for(var playerID in globalPlayers.players){
    var player = new GlobalPlayer(globalPlayers.players[playerID], x, y, width, height, 'orange', socket);
    console.log("\tnewly player created ", player);
    listUI.push(player);
    x += width * 2;
    if(x >= globalDisplayArea.endX){
      x = globalDisplayArea.startX;
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
    console.log("updateRoomData: ",room.players[playerID])
    var player = new Teammate(playerID, x, y, width, height, 'grey', socket);
    console.log(player);
    listUI.push(player);
    x += width * 2;
    if(x >= canvasW){
      x = 5;
      y += height * 2;
    }
  }
  var element = new Ready(350, 350, 50, 50, "purple", socket);
  listUI.push(element);
}

// function removeCreateRoomUI(){
//   removeUIElements("Create Room")
// }

function processMapDrawing(mapData){
  console.log("processMapDrawing");
  var allMap = document.createElement("canvas")
  allMap.width = 500*GRID_SIZE;
  allMap.height = 500*GRID_SIZE;
  var allMapCtx = allMap.getContext('2d');
  drawMap(allMapCtx, mapData)
  //console.log(mapData);/////*****
  deliverMapImageSrcToServer(allMap)
  // canvas.width = 500 * GRID_SIZE;
  // canvas.height = 500 * GRID_SIZE;
  // drawMap(mapData);
  // processImageDelivery();
}

function drawMap(allMapCtx, mapData){
  clearScreen(context);
  for (var x = 0; x < mapData.length; x++) {
    console.log("mapData.length = " + mapData.length)
    var line = "";//temporary
    for (var y = 0; y < mapData[mapData.length - 1].length; y++){
      console.log("mapData[mapData.length - 1].length = " + mapData[mapData.length - 1].length)
      if(mapData[x][y] != '')
      {
        // var source = mapData[x][y].textureSrc;
        // console.log(source)
        // var pattern = ctx.createPattern(source, "repeat");
        allMapCtx.fillStyle ="#B3B3B3";
        allMapCtx.beginPath();
        allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        allMapCtx.fill();
      }

      ////******
      if (mapData[x][y] == ''){
        line += "0";
      }else if(mapData[x][y].name == "wall"){
        line += "1";
      }else{
        line += "!";
      }
    }
    console.log(line);//////*****
  }
}

function deliverMapImageSrcToServer(allMap){

  mapImage.src = allMap.toDataURL();
  console.log('socket event create map called: URL set to', mapImage.src);/////*****
  socket.emit("deliverMapImageSrcToServer", mapImage.src);
  // delete canvas;
  delete allMap;
}

function requestMapImageFromServer(){
  if (mapImage.src == "") {
    console.log("request mapImage")
    socket.emit("requestMapImageSrcFromServer");
    socket.on("deliverMapImageSrcToClient", function(imageSrc){
      console.log("received mapImage")
      if (!mapImageLoaded && imageSrc != "") {
        mapImage.src = imageSrc;
        mapImageLoaded = true;
        console.log("imageSrc recieved: " + imageSrc)
      }
    });
  }// needs request for delivery
}

function clearMenu(areaName){
  context.clearRect(areaName.startX, areaName.startY, areaName.endX, areaName.endY);
}

function clearScreen(context){
  context.clearRect(canvasStartX, canvasStartY, canvasW, canvasH);
}

function gameStateProcessor(players, projectiles, enemies){
  //console.log("socket event state called");
  context.clearRect(canvasStartX, canvasStartY, canvasW, canvasH);

  var middleX = players[socket.id].x - (canvasW)/2;
  var middleY = players[socket.id].y - (canvasH)/2;
  shoot.middleX = middleX;
  shoot.middleY = middleY;

  //'zoom' functionality. It's not done yet! Please just leave it =1..
  //It only works on map-drawing, NOT collision.
  var zoom = 1;

  //drawing the map from mapURL
  context.drawImage(mapImage, middleX, middleY,
    canvasW, canvasH, 0, 0, canvasW*zoom, canvasH*zoom);

    context.fillStyle = 'green';
    for (var id in players) {
      var player = players[id];
      //Determines how the characters look
      context.beginPath();
      context.arc(player.x - middleX, player.y - middleY, GRID_SIZE/2 , 0, 2 * Math.PI);
      context.fill();
    }

    for (var id in projectiles) {
      var projectile = projectiles[id];
      //Determines how the bullets look
      context.beginPath();
      context.arc(projectile.x - middleX, projectile.y - middleY, 2, 0, 2 * Math.PI);
      context.fillStyle = 'white';
      context.fill();
    }

    for (var id in enemies) {

      var enemy = enemies[id];
      //Determines how the bullets look // old radius = 6
      context.beginPath();
      context.arc(enemy.x - middleX, enemy.y - middleY, GRID_SIZE/2, 0, 2 * Math.PI);
      context.fillStyle = 'red';
      context.fill();
    }

    context.fillStyle = "white";
    context.font = "15px Arial";
    context.fillText("Player: x: " + (players[socket.id].x/GRID_SIZE) + ", y: "
    + (players[socket.id].y/GRID_SIZE), canvasW-170, canvasH-50);
    context.fillText("Mouse: x: " + (mouseX+middleX)/GRID_SIZE + ", y: "
    + (mouseY+middleY)/GRID_SIZE, canvasW-170, canvasH-30);

    // var thisLoop = new Date();
    // context.fillText(Math.round(1000 / (thisLoop - lastLoop)) + " FPS", canvasW-70, canvasH-10);
    // lastLoop = thisLoop;
}

function playerInput(){
  setInterval(function() {
    socket.emit('movement', movement);
    socket.emit('shoot', shoot);
    //makeSound("bang");
  }, 1000 / 60);
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

function updateUIDrawing(name){
  for (var i = 0; i < listUI.length; i++) {
    var element = listUI[i];
    // console.log("listUI[",i,"] ",listUI[i])
    // if(element.name == something that is from room)
    if(element.name == name || name == undefined || name == ""){
      drawUIElement(element)
    }
  }
}

//read and draw UIElement onto canvas
function drawUIElement(element){
  context.font = "800 15px Verdana";
  context.fillStyle = element.color;
  context.beginPath();
  context.rect(element.x, element.y, element.width, element.height);
  context.fill();
  context.fillStyle = "white"; ///temp hardcoded
  var text = giveElementText(element);
  context.fillText(text, element.x + 10, element.y + 20);
  console.log("drawUIElement ", text, element.x, element.y, element.width, element.height)
  console.log("-------")
}

function giveElementText(element){
  if(element.userName != undefined){
    return element.userName;
  }else{
    return element.name;
  }
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
