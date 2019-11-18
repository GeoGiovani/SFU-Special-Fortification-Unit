// //Getting username
var username = document.getElementById('username');
username = username.innerHTML;
// var servername = document.getElementById('servername');
// servername = servername.innerHTML;

// console.log(`Hello ${username}!`);
// console.log(`Server ${servername}!`);


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

var loading = false;

window.addEventListener('click', function (e) {
  if (gameState != "menu") {
    return;
  }
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


socket.on('message', function(data) {
  // console.log(data);
});

//==========================================================================
//Lobby codes

socket.emit('player enters lobby');
updateUIDrawing();
// generalProcessor();

//commented out this part because menuProcessor is called only at the start,
//and gameProcessor is called when server emits some related events.
/////processors
// function generalProcessor(){
//   if(gameState == "menu"){
//     menuProcessor();
//   }else if(gameState == "game"){
//     gameProcessor();
//   }
// }

socket.on('enter new room', function(roomName) {
  console.log('enter new room called on client');
  gameState = "game";
  //gameProcessor(roomName);
});


// function menuProcessor(){
//   socket.on('main menu', function(){
//     console.log("main menu called");////temporary
//     // this.gameState = "menu";
//     socket.on('global', function(globalData){
//       updateGlobal(globalData);
//     });
//     socket.on('room', function(roomData){
//       updateRoom(roomData);
//     });
//     updateUIDrawing();
//   });
// }


socket.on('main menu', function(){
  //console.log("main menu called");////temporary
  updateUIDrawing();
});

socket.on('global', function(globalData){
  updateGlobal(globalData);
  updateUIDrawing();
});
socket.on('room', function(roomData){
  updateRoom(roomData);
  updateUIDrawing();
});

//
// function gameProcessor(roomName){
//   socket.on('in game',function(data){
//     // this.gameState = "game";
//     console.log("in game called");
//     //////
//
//     // newPlayerData = {"username" : username, "servername" : servername};
//     socket.emit('new player', username, roomName);
//   });
// }


function gameProcessor(roomName){
  socket.emit('new player', username, roomName);
}


///// Support functions

//update room UI menu
function updateGlobal(globalData){
  console.log("global called")
  console.log("\tdata: " + globalData);
  updateGlobalData(globalData);
  updateUIDrawing();
}
function updateRoom(roomData){
  console.log("room called")
  console.log("\troomData: " + roomData)
  updateRoomData(roomData);
  updateUIDrawing();
}
//update global players and rooms UI menu

function gameLoop(){

}

function updateGlobalData(globalData){
  // totalplayers = globalData.totalPlayers;
  // globalPlayers = globalData.globalPlayers;
  removeOldGlobalData();
  var x = 5;
  var y = 400;
  var width = 15;
  var height = 15;
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

function removeOldGlobalData(){
  // var elementName = 'Global Player'
  console.log("rremoveOldGlobalData")
  console.log("\tlistUI: " + listUI)
  // listUI = listUI.filter();
  console.log("\tlistUI: " + listUI)
}

function updateRoomData(roomData){
  var createRoom = new CreateRoom(100, 200, 200, 50, "black", this.socket, username);
  listUI.push(createRoom);
}

function updateGlobalDrawing(){

}

function updateUIDrawing(){
  if (gameState == 'game') {
    return;
  }
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("If this shows, updateUIDrawing() is being called.", 100, 100);
  for (var i = 0; i < listUI.length; i++) {
    var element = listUI[i];
    // if(element.name == something that is from room)
    drawUIElement(element)
  }
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
  context.fillText(element.name, element.x + 5, element.y + 5);
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


//==========================================================================


//socket id of the client. players[myId] will return the specific player's data.
var myId = "";
socket.on("passId", function(id){
  console.log('socket passId called');
  console.log(id);
  if (myId == "") {
    myId = id;
  }
});

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

//var hit = new Audio("HITMARKER.mp3");
//var bang = new Audio("batman punch.wav")
//hit.type = 'audio/mp3';
//bang.type = 'audio/wav';

var xPos = 0;
var yPos = 0;
var GRID_SIZE = 10; ///temporary variable

var mapImage = new Image();
mapImage.src = "";
var mapImageLoaded = false;
socket.on("deliverMapImageSrcToClient", function(imageSrc){
  // console.log('deliverMapImageSrcToClient called');
  if (!mapImageLoaded && imageSrc != "") {
    mapImage.src = imageSrc;
    mapImageLoaded = true;
  }
  //console.log('image source set to:', mapImage.src);
});


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
      shoot.x = xPos;
      shoot.y = yPos;
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
      shoot.x = xPos;
      shoot.y = yPos;
      break;
  }
});

// function makeSound(sound){
//   switch (sound){
//     case "hit":
//       hit.play();
//       break;
//     case "bang":
//       bang.play();
//       break;
//     break;
//   }
// }
// socket.on('sound', function(sound){
//   makeSound(sound);
// });

socket.on('grid-size', function(gridSize){
  GRID_SIZE = gridSize;
})
// newPlayerData = {"username" : username, "servername" : servername};
// socket.emit('new player', username, servername);

setInterval(function() {
  socket.emit('movement', movement);
  socket.emit('shoot', shoot);
  //makeSound("bang");
}, 1000 / 60);

var canvas = document.getElementById('canvas');
// var startX = 0;
// var startY = 0;
// var canvasW = 800;
// var canvasH = 600;
canvas.width = canvasW;
canvas.height = canvasH;
// canvas.cursor = "none"; //hide the original cursor
var lastLoop = new Date();  //this is used for getting fps

window.addEventListener('mousemove', function (e) {
  xPos = e.pageX;
  yPos = e.pageY;
  // console.log(xPos);
  // console.log(yPos);
});

var context = canvas.getContext('2d');
socket.on('state', function(players, projectiles, enemies) {
  //console.log('state called on client side');
  if (loading) {
    return;
  }
  //console.log("socket event state called");
  if (myId == "") {
    console.log('requesting id...');
    socket.emit('requestPassId');
    return;
  }
  if (!mapImageLoaded) {
    console.log('requesting map...');
    socket.emit("requestMapImageSrcFromServer");
    return;
  }
  context.clearRect(canvasStartX, canvasStartY, canvasW, canvasH);

  var middleX = players[myId].x - (canvasW)/2;
  var middleY = players[myId].y - (canvasH)/2;
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
  context.fillText("Player: x: " + (players[myId].x/GRID_SIZE) + ", y: "
    + (players[myId].y/GRID_SIZE), canvasW-170, canvasH-50);
  context.fillText("Mouse: x: " + (xPos+middleX)/GRID_SIZE + ", y: "
    + (yPos+middleY)/GRID_SIZE, canvasW-170, canvasH-30);

  var thisLoop = new Date();
  context.fillText(Math.round(1000 / (thisLoop - lastLoop)) + " FPS", canvasW-70, canvasH-10);
  lastLoop = thisLoop;
});


socket.on("create map", function(mapData){
  processMapDrawing(mapData);
});


// Support Functions ------------------------------------
function processMapDrawing(mapData){
  console.log(mapData);
  loading = true;
  context.clearRect(canvasStartX, canvasStartX, canvasW, canvasH);
  context.fillStyle = "white";
  context.font = "30px Arial";
  context.fillText("Loading . . .", (canvasW/2-100), (canvasW/2-30));
  //called ONLY when numPlayers: 0 -> 1.
  //draws the whole canvas, and saves to images file.
  /*
  This creates the map to 'image', hence the collision control is separate
  this map. when there is a revision to map (e.g. door open)
  */
  //shows only wall now.
   // TODO: change this to variable, not constant literal!
  //const margin = 300;
  var allMap = document.createElement("canvas");
  allMap.width = 500*GRID_SIZE;
  allMap.height = 500*GRID_SIZE;
  var allMapCtx = allMap.getContext('2d');


  /*
  aqImage = new Image();
  aqImage.src = '../image/aq.jpeg';
  aqImage.onload = function(){
    context.drawImage(aqImage, 0, 0);
  }*/

  for (var x = 0; x < mapData.length; x++) {
    var line = "";
    //console.log("mapdata is running");
    for (var y = 0; y < mapData[mapData.length - 1].length; y++){
      // console.log("\tMapdata[" + x + "][" + y + "]"); ////*****
      //console.log("hi qt");
      if(mapData[x][y] != '')
      {
        // var source = mapData[x][y].textureSrc;
        // console.log(source)
        // var pattern = ctx.createPattern(source, "repeat");
        allMapCtx.beginPath();
        allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        allMapCtx.fillStyle =" #B3B3B3";
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
    //console.log(line);//////*****
  }
  //console.log(mapData);/////*****
  mapImage.src = allMap.toDataURL();
  console.log('socket event create map called: URL set to', mapImage.src);/////*****
  socket.emit("deliverMapImageSrcToServer", mapImage.src);
  mapImageLoaded = true;
  loading = false;
  delete allMap;
}

//=============================================================================
// George Workpace
var logoutButton = document.getElementById('log_out_button');
logoutButton.addEventListener('click', function(event) {
  logoutButton.value = username;
});

//=============================================================================

  // Fazal' Workstation -------------------------------------------------------------------------
  // var enemyContext = canvas.getContext('2d');
  // socket.on('enemyState', function(enemies) {
  //   context.clearRect(0, 0, 800, 600);
  //   context.fillStyle = 'red';
  //   for (var id in enemies) {
  //     var enemy = enemies[id];
  //     //Determines how the characters look
  //     context.beginPath();
  //     context.arc(enemy, enemy, 10, 0, 2 * Math.PI);
  //     context.fill();
  //   }
  // });

  // get a refrence to the canvas and its context
// var canvas = document.getElementById("canvas");
// var context = canvas.getContext("2d");

// newly spawned objects start at Y=25
// var spawnLineY = 25;

// // spawn a new object every 1500ms
// var spawnRate = 1500;

// // set how fast the objects will fall
// var spawnRateOfDescent = 0.50;

// // when was the last object spawned
// var lastSpawn = -1;

// // this array holds all spawned object
// // var objects = [];
// var enemies = {
//   numEnemies: 0
// }

// save the starting time (used to calc elapsed time)
// var startTime = Date.now();

// // start animating
// animate();

// var enemyID = 0;

// function spawnRandomObject() {

//     // select a random type for this new object
//     var t;

    // About Math.random()
    // Math.random() generates a semi-random number
    // between 0-1. So to randomly decide if the next object
    // will be A or B, we say if the random# is 0-.49 we
    // create A and if the random# is .50-1.00 we create B

//     if (Math.random() < 0.50) {
//         t = "red";
//     } else {
//         t = "blue";
//     }

//     // create the new object
//     var enemy = {
//         // set this objects type
//         type: t,
//         // set x randomly but at least 15px off the canvas edges
//         x: Math.random() * (canvas.width - 30) + 15,
//         // set y to start on the line where objects are spawned
//         y: spawnLineY,
//     }

//     // add the new object to the objects[] array
//     enemies[enemyID] = enemy;
//     enemyID++;
// }

// spawnRandomObject();

// function animate() {

//     // get the elapsed time
//     var time = Date.now();

    // // see if its time to spawn a new object
    // if (time > (lastSpawn + spawnRate)) {
    //     lastSpawn = time;
    //     spawnRandomObject();
    // }

//     // request another animation frame
//     requestAnimationFrame(animate);

//     // clear the canvas so all objects can be
//     // redrawn in new positions
//     context.clearRect(0, 0, canvas.width, canvas.height);

//     // draw the line where new objects are spawned
//     context.beginPath();
//     context.moveTo(0, spawnLineY);
//     context.lineTo(canvas.width, spawnLineY);
//     context.stroke();

//     // move each object down the canvas
//     for (var i = 0; i < objects.length; i++) {
//         var object = objects[i];
//         object.y += spawnRateOfDescent;
//         context.beginPath();
//         context.arc(object.x, object.y, 8, 0, Math.PI * 2);
//         context.closePath();
//         context.fillStyle = object.type;
//         context.fill();
//     }

// }

// -----------------------------------------------------------------------
