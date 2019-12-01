//Getting username
var username = document.getElementById('username');
username = username.innerHTML;
var servername = document.getElementById('servername');
servername = servername.innerHTML;
var canvas = document.getElementById('canvas');

console.log(`Hello ${username}!`);
console.log(`Server ${servername}!`);

//these two messages are related to function 'showMessage'.
var messageOn = true;
var messageQueue = ["Welcome to S.F.U.! \nPress B to continue."
  , "S.F.U. stands for Special Fortification Unit."
  , "What? You mean, S.F.U. is Simon Fraser University?"
  , "Well, who cares about that Simon Fraser guy who \ndestroyed aboriginal culture?"
  , "Press W/A/S/D to move, B to see next message."
  , "Press M to turn on/off the map."
  , "Move mouse and click to shoot."
  , "And survive."
  , "What? You mean, we didn't talk about this kind of story \nin the meetings?"
  , "I know, I just wanted to put this in. -Hailey"
  , "If you are bored, you can go kill the enemies."
  , "And we have a cool weather feature on top right."
  , "Don't forget to turn on the music."
  , "Good luck, have fun!"];
var mapOn = true;

// dead.
var dead = false;
var deadMessage = ["We're looking for Co-op!\n\nHailey | Fall 2020 | haa40@sfu.ca   resume ready :D\nWrite you names here let's get a job"]

//zoneChange function related.
var zoneChangeOn = false;
var zoneChangeOnTime;
var zoneNum = 0;

var questMessageOn = false;
var questMessageOnTime;
var questName = "";
var questCondition = "";
var questDescription = "";

var socket = io();
var gameState; //determine the listUI elements
var listUI = []; //reset every change in gameState
var totalPlayers;
var globalPlayers = [];
var rooms;
var roomData;
// var mapImageEmitCount = 0;
// var maxMapImageEmitCount;
// var mapReady = false;
// var socket.id = "";
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

var lastLoop = new Date();  //this is used for getting fps
// var socket.id = "";

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
var action = {
  interaction: false,
  reload: false
}

var sound = {
  background: null,
  shoot: null,
  reload: null,
  hit: null
}

document.addEventListener('keydown', function(event) {
  console.log(event.keyCode)
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
    case 69: // E
      action.interaction = true;
      break;
    case 82: // R
      action.reload = true;
      break;
    case 66: // B
      if (messageQueue.length <= 0) {
        messageOn = false;
      }
      else {
        messageQueue.shift();
        if (messageQueue.length <= 0) {
          messageOn = false;
        }
      }
      break;
    case 77:
      mapOn = !mapOn;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  console.log(event.keyCode)
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
    case 69: // E
      action.interaction = false;
      break;
    case 82: // R
      var newAudio = sound.reload.cloneNode()
      newAudio.play()
      action.reload = false;
      break;
  }
});

canvas.addEventListener('click', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
  processClick(mouseX, mouseY);
  console.log("shoot bullet")
  var newAudio = sound.shoot.cloneNode()
  newAudio.play()
  shoot.shootBullet = true;
  shoot.x = mouseX;
  shoot.y = mouseY;
});

canvas.addEventListener('mousemove', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
});

function makeSound(sound){
  var newAudio = new Audio();
  switch (sound) {
    case "shoot":
      newAudio = sound.shoot.cloneNode()
      newAudio.play();
      break;
    case "reload":
      newAudio = sound.reload.cloneNode()
      newAudio.play();
      break;
    break;
  }
}

function initSound(){
  sound.background = new Audio();
  sound.shoot = new Audio();
  sound.reload = new Audio();
  sound.hit = new Audio();
  sound.background.src = "";
  sound.shoot.src =  "../static/audio/9mm.mp3";
  sound.reload.src = "../static/audio/reload.mp3";
  sound.hit.src = "../static/audio/HITMARKER.mp3";
}

clientGeneralProcessor();

function clientGeneralProcessor(){
  initLogOutButton();
  socket.on('main menu', function(){
    initSound();
    this.gameState = "menu";
    clientMenuProcessor();
  });
  socket.on('in game',function(){//added roomData, concertn for inconsistency
    this.gameState = "game"
    clientGameProcessor();
  });
}

function initLogOutButton(){
  var logoutButton = document.getElementById('log_out_button' );
  logoutButton.addEventListener('click', function(event) {
    logoutButton.value = username;
  });
}

function clientMenuProcessor(){
  console.log("socket.id = " + socket.id)//temporary
  console.log("main menu called");////temporary
  initBasicMenuUI()
  // socket.on("passId", function(socketID){
  //   this.socket.id = socketID;
  // })

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
  socket.on('game startable', function(){
    socket.emit('proceed start game');
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
  // if (socket.id == "") {
  // }

  socket.on('message', function(data) {
    showMessage(data);
  });

  socket.on('refresh screen', function(){
    this.gameState = "game";
    listUI = {};
    updateUIDrawing();
  });

  socket.emit('owner process map')
  socket.on("grid size", function(size){
    console.log("received GRID_SIZE",size)
    GRID_SIZE = size
    console.log("GRID_SIZE = " + GRID_SIZE);
  });
  socket.on('draw map', function(mapData){
    console.log("draw map called")
    processMapDrawing(mapData);
  });// last change: only room owner deliver mapImage, other will receieve mapImage from server
  // socket.on('map processed', function(){
  //   console.log("map is processed")
  //   // requestMapImageFromServer();
  // });
  socket.emit('character creation')
  // socket.on('game loop', function(){
  // socket.on("deliverMapImageSrcToClient", function(imageSrc, mapReady){
  //   console.log("imageSrc received ", imageSrc)
  //   console.log("mapReady received ", mapReady);
  //   if(mapReady && imageSrc == '') {
  //     mapImage.src = imageSrc;
  //     mapImageLoaded = true;
  //   }
  // });
  // socket.on('map image emit count', function(maxMapImageEmitCount){
  //   this.maxMapImageEmitCount = maxMapImageEmitCount;
  // });
  // while(!mapImage.src.match('image/png')){
  //   console.log("request loop")
  //   setTimeout(function(){
  //     // console.log("mapReady value", this.mapReady)
  //     // if(!mapReady){
  //     //   console.log("mapReady")
  //     //   if(!mapImage.src.match('image/png')){
  //     //     console.log("\trequest mapimage")
  //         console.log("current mapImage", mapImage.src)
  //         requestMapImageFromServer();
  //         // if(mapImage.src.match('image/png')){
  //         //   mapImageEmitCount++;
  //         //   mapReady = true;
  //         // }
  //         //
  //         console.log("\tmapImagesrc after request", mapImage.src)
  //     //   }
  //     // }
  //     // console.log("\tmapReady after", this.mapReady)
  //   }, 1000)
  // }
  clientGameLogic(socket);
    // for(var player in players){
      //   // console.log("player: " + player)
      // }
      // console.log("socket.id: " + socket.id)
  // })
  // console.log("mapImageSrc", mapImage.src)
  // console.log("mapImageSrmatch? ", mapImage.src.match('image/png'))
  // if(mapImage.src.match('image/png') != true){
  //   requestMapImageFromServer(socket);
  // }
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
  // console.log("enesocket.id " + room.enesocket.id)
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
  deliverMapImageSrcToServer(allMap)
}

function drawMap(allMapCtx, mapData){
  clearScreen(context);
  for (var x = 0; x < mapData.length; x++) {
    var line = "";
    for (var y = 0; y < mapData[mapData.length - 1].length; y++){
      // var textureLoaded = false;
      // texture.onload = function(){
      //   textureLoaded = true;
      // }
      var wall = document.getElementById("wall")
      if(mapData[x][y] != '' && mapData[x][y].name == "floor")
      {
        allMapCtx.beginPath();
        allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        allMapCtx.fillStyle = mapData[x][y].color;
        allMapCtx.fill();
      }
      else if(mapData[x][y] != '' && mapData[x][y].name == "wall")
      {
        // var source = mapData[x][y].textureSrc;
        // console.log(source)
        // var pattern = ctx.createPattern(source, "repeat");
        // allMapCtx.beginPath();
        // allMapCtx.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        // //TODO: MAPTEXTURE Problem here below lines!!
        // // allMapCtx.fillStyle = texture.src;
        // allMapCtx.fillStyle = "#333";
        allMapCtx.drawImage(wall, x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        // while (!textureLoaded) {
        //   console.log("waiting for the texture...");
        // }

        allMapCtx.fill();
      }

      if (mapData[x][y] == ''){
        line += "0";
      }else if(mapData[x][y].name == "wall"){
        line += "1";
      }else{
        line += "!";
      }
    }
  }
}

function showMessage(messageString) {
  messageOn = true;
  messageQueue.push(messageString);
}

function showDeadScreen() {
  if (dead) {
    return;
  }
  dead = true;
  context.clearRect(startX, startY, canvasW, canvasH);
  context.beginPath();
  context.fillStyle = "#BB0000";
  context.rect(0, 0, canvasW, canvasH);
  context.fill();

  context.fillStyle = "white";
  context.font = "80px Arial";
  context.fillText("You Failed!", canvasW/2-200, canvasH/2-50);

  context.fillStyle = "white";
  context.font = "20px Arial";
  var messageNum = Math.random() * deadMessage.length;
  console.log(messageNum);
  var deadMsg = deadMessage[Math.floor(messageNum)];
  var lines = deadMsg.split('\n');
  for (var i = 0; i<lines.length; i++) {
    context.fillText(lines[i], 120, canvasH/2 + 50 + 30*i);
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
  console.log("inside request mapImg function with mapImg: ", mapImage.src)
  console.log("request mapImage")
  socket.emit("requestMapImageSrcFromServer");

  // var roomData = rooms[]
  // while (!roomData.mapReady) {
    // setTimeout(function(){
        // console.log("\treceived mapImage")
        // // if (!mapImageLoaded && imageSrc != "") {
        //   mapImage.src = imageSrc;
        //   mapImageLoaded = true;
        //   console.log("\t\timageSrc recieved: " + imageSrc)
        //   // }

    // }, 1000)
  // }// needs request for delivery
}

function clearMenu(areaName){
  context.clearRect(areaName.startX, areaName.startY, areaName.endX, areaName.endY);
}

function clearScreen(context){
  context.clearRect(canvasStartX, canvasStartY, canvasW, canvasH);
}

function clientGameLogic(socket){
  socket.on("deliverMapImageSrcToClient", function(imageSrc){
    // console.log("imageSrc received ", imageSrc)
    // console.log("mapReady received ", mapReady);
    // if(mapReady || imageSrc != '') {
      mapImage.src = imageSrc;
      mapImageLoaded = true;
    // }
  });

  socket.on("zoneChange", function(num){
    //zone changed!
    zoneChangeOn = true;
    zoneChangeOnTime = new Date();
    zoneNum = num;
  });

  socket.on("questOver", function(qName, qCondition, qDescription) {
    questMessageOn = true;
    questMessageOnTime = new Date();
    questName = qName;
    questCondition = qCondition;
    questDescription = qDescription;
    // console.log("show quest: ", qName);
  });

  socket.on("zoneOpen", function(zoneNum) {
    console.log(zoneNum);
  });

  socket.on('state', function(players, numPlayers, projectiles, numProjectiles, enemies, numEnemies, zones, teamQuests, boss) {
    gameStateProcessor(players, numPlayers, projectiles, numProjectiles, enemies, numEnemies, zones, teamQuests, boss)
  });
  playerInput();
}

function gameStateProcessor(players, numPlayers, projectiles, numProjectiles, enemies, numEnemies, zones, teamQuests, boss){
  //console.log("socket event state called");
  // if(mapImageEmitCount < maxMapImageEmitCount * 20){

  // }
  if (players[socket.id] == 0) {
    //Died
    showDeadScreen();
    return;
  }

  context.clearRect(canvasStartX, canvasStartY, canvasW, canvasH);

  var middleX = players[socket.id].x - (canvasW) / 2;
  var middleY = players[socket.id].y - (canvasH) / 2;
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
      showHealthBarAbove(player.x - middleX, player.y - middleY, player.health, player.maxHealth);
      showBulletBarAbove(player.x - middleX, player.y - middleY, player.clip, player.clipSize);
    }

    var bossImg = document.getElementById("boss");
    // context.drawImage(bossImg, boss.x - middleX, boss.y - middleY, 100, 130);

    for (var id in projectiles) {
      var projectile = projectiles[id];
      //Determines how the bullets look
      // context.drawImage('../public/image/George.jpeg', projectile.x - middleX, projectile.y - middleY,10,10);
      context.beginPath();
      context.arc(projectile.x - middleX, projectile.y - middleY, 2, 0, 2 * Math.PI);
      context.fillStyle = 'blue';
      context.fill();
    }

    for (var id in enemies) {
      var enemy = enemies[id];
      //Determines how the bullets look // old radius = 6
      context.drawImage(bossImg, enemy.x - middleX, enemy.y - middleY, GRID_SIZE, GRID_SIZE);
      // context.beginPath();
      // context.arc(enemy.x - middleX, enemy.y - middleY, GRID_SIZE/2, 0, 2 * Math.PI);
      // context.fillStyle = 'red';
      // context.fill();
      showHealthBarAbove(enemy.x - middleX, enemy.y - middleY, enemy.health, enemy.maxHealth);
    }

    context.fillStyle = "rgba(100, 100, 100, 0.3)";
    for (var id in zones) {
      var zone = zones[id];
      if (!zone.open) {
        context.beginPath();
        context.rect((zone.x*GRID_SIZE - middleX), (zone.y*GRID_SIZE - middleY), zone.width*GRID_SIZE, zone.height*GRID_SIZE);
        context.fill();
      }
    }

    context.font = "15px Arial";
    if(players[socket.id].clip) {
      context.fillStyle = "red";
      context.fillText("AMMO: " + players[socket.id].clip + "/" + players[socket.id].clipSize, canvasW-100, canvasH-70);
    }
    if(!players[socket.id].clip) {
      context.fillStyle = "red";
      context.fillText("RELOAD",  canvasW-70, canvasH-70);
    }

    var thisLoop = new Date();
    context.fillText(Math.round(1000 / (thisLoop - lastLoop)) + " FPS", canvasW-95, canvasH-10);
    lastLoop = thisLoop;

    //showing Player health/score/etc.
    showMyData(players[socket.id]);
    var playerIndex = 1;
    for (var id in players) {
      if (id != socket.id && players[id] != 0 && players[id].health != undefined) {
        showOtherPlayerData(players[id], playerIndex);
        playerIndex += 1;
      }
    }

    showQuests(players[socket.id], teamQuests);

    // related to function 'showMessage'.
    if (messageOn && messageQueue.length >= 1) {
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      var zone = zones[id];
      context.beginPath();
      context.rect(20, 400, canvasW - 40, canvasH - 420);
      context.fill();
      context.fillStyle = "white";
      context.font = "25px Arial";
      var lines = messageQueue[0].split('\n');
      for (var i = 0; i<lines.length; i++) {
        context.fillText(lines[i], 40, 440 + i*35);
      }
    }

    //show small map!
    if (mapOn) {
      //hard-coded numbers.
      var mapX = 580;
      var mapY = 20;
      var mapMargin = 5;
      var mapWHRatio = 6/8;
      var smallMapWidth = 200;
      var smallMapHeight = smallMapWidth*mapWHRatio;

      var mapLeftCut = 60*GRID_SIZE;
      var mapTopCut = 20*GRID_SIZE;
      var mapAreaWidth = 380*GRID_SIZE;
      var mapAreaHeight = mapAreaWidth*mapWHRatio;



      //drawing black box behind the map
      context.beginPath();
      context.rect(mapX-mapMargin, mapY-mapMargin, smallMapWidth+2*mapMargin,
        smallMapHeight+2*mapMargin);
      context.fillStyle = "black";
      context.fill();

      //drawing the small map
      context.drawImage(mapImage, mapLeftCut, mapTopCut,
        mapAreaWidth, mapAreaHeight,
        mapX, mapY, smallMapWidth, smallMapHeight);


      // white background for coordinates
      context.fillStyle = "rgba(255, 255, 255, 0.82)";
      context.beginPath();
      context.rect(mapX+3, mapY+smallMapHeight+8, smallMapWidth,
        smallMapHeight*(1/3));
      context.fill();
      //showing player and mouse coordinates.
      context.fillStyle = "blue";
      context.font = "15px Arial";
      context.fillText("Player: x: " + (players[socket.id].x/GRID_SIZE) + ", y: "
        + (players[socket.id].y/GRID_SIZE), mapX+10, mapY+smallMapHeight+30);
      context.fillText("Mouse: x: " + (mouseX+middleX)/GRID_SIZE + ", y: "
        + (mouseY+middleY)/GRID_SIZE, mapX+10, mapY+smallMapHeight+50);

      //show players on small map

      for (var id in players) {
        var player = players[id];
        context.fillStyle = 'green';
        if (id == socket.id) {
          context.fillStyle = '#BBAA22';
        }
        context.beginPath();
        context.arc(mapX+(player.x-mapLeftCut)*(smallMapWidth/mapAreaWidth),
          mapY+(player.y-mapTopCut)*(smallMapWidth/mapAreaWidth),
          GRID_SIZE/3 , 0, 2 * Math.PI);
        context.fill();
      }

    }

    //zone Change show
    if (zoneChangeOn) {
      var zoneElapse = new Date();
      var zoneboxY = 500;
      var boxLength = zones[zoneNum].description.length*13;
      if (zoneElapse - zoneChangeOnTime > 5000) {
        zoneChangeOn = false;
        context.fillStyle = `rgba(255, 255, 255, 0)`;
      }
      else if (zoneElapse - zoneChangeOnTime < 800) {
        context.fillStyle = `rgba(255, 50, 50, ${0.9*((zoneElapse - zoneChangeOnTime))/800})`;
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*((zoneElapse - zoneChangeOnTime))/800})`;
      }
      else if (zoneElapse - zoneChangeOnTime > 3000) {
        context.fillStyle = `rgba(255, 50, 50, ${0.9*(3000+2000-(zoneElapse - zoneChangeOnTime))/2000})`;
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*(3000+2000-(zoneElapse - zoneChangeOnTime))/2000})`;
      }
      else {
        context.fillStyle = "rgba(255, 50, 50, 0.9)";
        context.beginPath();
        context.rect(10, zoneboxY, boxLength, 85);
        context.fill();
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
      }
      context.font = "italic 35px Arial";
      context.fillText("ENTER: "+zones[zoneNum].name, 50, zoneboxY+40);

      context.font = "italic 15px Arial";
      context.fillText("- " + zones[zoneNum].description, 40, zoneboxY+70);

      context.font = "normal";
    }

    //zone Change show
    if (questMessageOn) {
      var questElapse = new Date();
      var questboxY = 500;
      var boxLength = 700;
      if (questElapse - questMessageOnTime > 5000) {
        questMessageOn = false;
        context.fillStyle = `rgba(255, 255, 255, 0)`;
      }
      else if (questElapse - questMessageOnTime < 800) {
        context.fillStyle = `rgba(200, 180, 0, ${0.9*((questElapse - questMessageOnTime))/800})`;
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*((questElapse - questMessageOnTime))/800})`;
      }
      else if (questElapse - questMessageOnTime > 3000) {
        context.fillStyle = `rgba(200, 180, 0, ${0.9*(3000+2000-(questElapse - questMessageOnTime))/2000})`;
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = `rgba(255, 255, 255, ${0.9*(3000+2000-(questElapse - questMessageOnTime))/2000})`;
      }
      else {
        context.fillStyle = "rgba(200, 180, 0, 0.9)";
        context.beginPath();
        context.rect(10, questboxY, boxLength, 85);
        context.fill();
        context.fillStyle = "rgba(255, 255, 255, 0.9)";
      }
      context.font = "italic 35px Arial";
      context.fillText("COMPLETE: "+questName, 50, questboxY+40);

      context.font = "italic 15px Arial";
      context.fillText("["+questCondition + "]   " + questDescription, 40, questboxY+70);

      context.font = "normal";
    }

    if (players[socket.id].health < players[socket.id].maxHealth) {
      context.fillStyle = `rgba(255, 0, 0,
        ${0.3*((players[socket.id].maxHealth-players[socket.id].health)/players[socket.id].maxHealth)})`;
        context.beginPath();
        context.rect(0, 0, canvasW, canvasH);
        context.fill();
      }
}

function playerInput(){
  setInterval(function() {
    socket.emit('movement', movement);
    socket.emit('shoot', shoot);
    socket.emit('interact', action);
    shoot.shootBullet = false;
  }, 1000 / 30);
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
  console.log("gameState", gameState)
  if(index != -1){
    console.log("Found clickable index: ",index," name: ",listUI[index].name)
    this.listUI[index].interaction();
  }else if(index == -1){
    console.log("No clickable")
    // if(gameState == "game"){
    //   console.log("shoot bullet")
    //   makeSound("shoot");
    //   shoot.shootBullet = true;
    //   shoot.x = mouseX;
    //   shoot.y = mouseY;
    // }
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

function showMyData(player) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(15, 70, 100, 15);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(15, 70, (player.health/player.maxHealth)*100, 15);
  context.fill();
  context.fillStyle = "white";
  context.font = "bold italic 12px Arial";
  context.fillText("HP (" + Math.round(player.health) + "/" + player.maxHealth + ")", 18, 82);
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(15, 90, 100, 15);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(15, 90, (player.clip/player.clipSize)*100, 15);
  context.fill();
  context.fillStyle = "white";
  context.font = "bold italic 12px Arial";
  context.fillText("CLIP (" + player.clip + "/" + player.clipSize + ")", 18, 102);

  context.fillStyle = "black";
  context.font = "bold 35px Arial";
  context.fillText(player.username, 17, 50);
}
function showOtherPlayerData(player, playerIndex) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(70+110*playerIndex, 55, 70, 10);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(70+110*playerIndex, 55, (player.health/player.maxHealth)*70, 10);
  context.fill();
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(70+110*playerIndex, 68, 70, 10);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(70+110*playerIndex, 68, (player.health/player.maxHealth)*70, 10);
  context.fill();

  context.fillStyle = "black";
  context.font = "bold 20px Arial";
  context.fillText(player.username, 70+110*playerIndex+2, 45);


}
function showQuests(player, teamQuests) {
  var line = 0;
  context.fillStyle = "#0AC";
  context.strokeStyle = "rgb(255, 255, 255, 0.5)";
  context.font = "16px Arial";
  context.strokeText("Quests", 12, 150);
  context.fillText("Quests", 12, 150);

  context.fillStyle = "#0D8";
  var i = 0;
  for (; i < teamQuests.length; i++) {
    if (teamQuests[i].display) {
      if (teamQuests[i].isMainQuest) {
          context.font = "bold italic 13px Arial";
      }
      else {
          context.font = "italic 13px Arial";
      }
      context.strokeText("["+teamQuests[i].name + "] " + teamQuests[i].condition + " " + teamQuests[i].progressText, 10, 170+line*20);
      context.fillText("["+teamQuests[i].name + "] " + teamQuests[i].condition + " " + teamQuests[i].progressText, 10, 170+line*20);
      line += 1;
      if (line > 10) {
        break;
      }
    }
  }

  context.fillStyle = "#0AC";
  context.strokeStyle = "rgb(255, 255, 255, 0.5)";
  for (; i < player.quests.length+teamQuests.length; i++) {
    var j = i-teamQuests.length;
    if (player.quests[j].display) {
      if (player.quests[j].isMainQuest) {
          context.font = "bold italic 13px Arial";
      }
      else {
          context.font = "italic 13px Arial";
      }
      context.strokeText("["+player.quests[j].name + "] " + player.quests[j].condition + " " + player.quests[j].progressText, 10, 170+line*20);
      context.fillText("["+player.quests[j].name + "] " + player.quests[j].condition + " " + player.quests[j].progressText, 10, 170+line*20);
      line += 1;
      if (line > 10) {
        break;
      }
    }
  }
}

function showHealthBarAbove(x, y, health, maxHealth) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(x-20, y-30, 40, 6);
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.rect(x-20, y-30, (health/maxHealth)*40, 6);
  context.fill();
}
function showBulletBarAbove(x, y, clip, clipSize) {
  context.fillStyle = "#BBB";
  context.beginPath();
  context.rect(x-20, y-20, 40, 6);
  context.fill();
  context.fillStyle = "blue";
  context.beginPath();
  context.rect(x-20, y-20, (clip/clipSize)*40, 6);
  context.fill();
}



//
// //gameState used to know whether game is in main menu or in-game
// function hasUIElement(x, y){
//
//   console.log("wrong gameState");
//   return false;
// }
