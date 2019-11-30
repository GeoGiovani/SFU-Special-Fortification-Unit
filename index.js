.enemies.numEnemies.players.numPlayersmodule.exports = {
  sayHello: function(){
    return 'hello';
  },

  addNumbers: function(value1, value2) {
    return value1 + value2;
  },
  //Tests that roomData() creates a room object
  roomData: function(value1) {
    return roomData(value1);
  },
  //Tests that createRoom() creates a room with name roomName
  createRoom: function(roomName) {
    createRoom(roomName);
    return returnRooms();
  },
  //Tests that createRoom() correctly handles a request to make duplicate room
  createTwoRooms: function(roomName) {
    createRoom(roomName);
    createRoom(roomName);
    return returnRooms();
  },
  //Tests that createlayer() correctly creates a player with ID socketID inside
  //the room roomName
  createPlayer: function(socketID, roomName, username) {
    createRoom(roomName);                        //Create a room
    createPlayer(socketID, roomName, username);  //Create player within room
    return returnRooms();
  },
  //Test player movement
  testMovePlayer: function(socketID, roomName, username, directionData) {
    // createRoom(roomName);                        //Create a room
    createPlayer(socketID, roomName, username);  //Create a player for moving
    player = rooms[roomName].players[socketID];
    origin = [player.x, player.y];                 //Player's starting position

    movePlayer(player, directionData, roomName); //Move the player
    result = [player.x, player.y];                 //Position player moved to
    return { "start" : origin, "end" : result, "speed" : player.speed };
  },

  //Test player-wall collisions
  testCollision: function(socketID, roomName, username, directionData) {
    createRoom(roomName);
    createPlayer(socketID, roomName, username);
    player = rooms[roomName].players[socketID]
    for (i = 0; i < 200; i++) {
      movePlayer(player, directionData, roomName);
    }
    ddx = 0; ddy = 0;
    if (directionData.left) {
      ddx -= player.speed/updatePerSecond;
    }
    if (directionData.right) {
        ddx += player.speed/updatePerSecond;
    }
    if (directionData.down) {
        ddy += player.speed/updatePerSecond;
    }
    if (directionData.up) {
        ddy -= player.speed/updatePerSecond;
    }
    return hasCollision((player.x + ddx), (player.y + ddy), roomName);
  },

  //Projectile testing
  generateProjectiles: function(socketID, rm, msCoords) {
    createRoom(rm);                             //Create a gun range
    createPlayer(socketID, rm, "OJ");           //Create a shooter
    generateProjectile(socketID, msCoords, rm); //Create projectile
    return returnProjectiles(rm);
  },
  moveProjectiles: function(rm) {
    moveProjectiles(rm);
    return returnProjectiles(rm);
  },
  deleteProjectile: function(projectileID, rm) {
    deleteBullet(projectileID, rm);
    return returnProjectiles(rm);
  },
  // Tests randomObjects aka enemies spawn correctlty
  testSpawn: function(){
    //spawnRandomObject();
    return 1;
  },

  // Tests generateEnemies
  testGenerateEnemies: function(){
    //generateEnemies();
    return 10;
  },

  // Tests Enemy Movements
  testEnemyMovement: function(){
    enemyMove = 5;
    // enemies = generateEnemies();
    // enemyMove = moveEnemies(enemies);
    return enemyMove;
  }
}

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const fs = require('fs');
var app = express();
var server = http.Server(app);
app.set('port', 5000);
const PORT = process.env.PORT || 5000
var io = socketIO(server);
//database
const { Pool } = require('pg')
var pool
var updatePerSecond = 30;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


// var rooms[room];
// var room[socket.id];

app.use('/static', express.static(__dirname + '/static'));// Ring
app.get('/', function(request, response) {
  // response.sendFile(path.join(__dirname, 'index.html'));
  var user = {"username" : "shi"}
  response.render('pages/index', user);
  // response.render(__dirname + "/index.html")
});// Starts the server.
server.listen(PORT, function() {
  console.log('Starting server on port 5000');
});

//setting up default viewpath to views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Looking for static files in public folder
app.use(express.static(path.join(__dirname, 'public')));


var totalPlayers = 0;
var globalPlayers = {
  players : [],
};
var rooms = {};
var getRoomBySocketId = {};
var mapImageSrc = "";
const GRID_SIZE = 10;

setInterval(function() {
  for (var rm in rooms) {
    if(rooms[rm].gameState == "game" && rooms[rm].players.numPlayers > 0){
      // console.log("Rooms[" + rm + "]: ", rooms[rm])
      // console.log("Rooms[" + rm + "],players: ", rooms[rm].players)
      //  console.log("interval player")
      moveProjectiles(rm);
      moveEnemies(rm);
      handleBulletCollisions(rm);
      generateEnemies(rm);
      recoverPlayerHealth(rm);
      checkQuest(rm);
          //console.log("LOGGING rm", rm);
          io.sockets.to(rm).emit('state', rooms[rm].players,
            rooms[rm].projectiles, rooms[rm].enemies, rooms[rm].zones, rooms[rm].teamQuests);
        }
  }
}, 1000/ updatePerSecond);// last change: create different functions for mapImage delivery, new condition for setInterval, rooms now have gameState

io.on('connection', function(socket){/// needs function to remove globalPlayers/rooms elements when player disconnect
  var gameState = "menu"
  initConnection(socket);
  serverGeneralProcessor(socket, gameState);

  socket.on('disconnect', function() {
    processDisconnect(socket);
  });
});

function initConnection(socket){
  console.log("connection : " + socket.id)
  totalPlayers++;
  console.log("totalPlayers : " + totalPlayers)
  if(totalPlayers > 0){
    var userName = socket.id; //temporary
    globalPlayers.players.push(socket.id); //push socket.id and username
    console.log("globalPlayers.players", globalPlayers.players)
  }
  console.log(globalPlayers)
}

function serverGeneralProcessor(socket, gameState){
  var data = {
    totalPlayers,
    globalPlayers,
    rooms,
    getRoomBySocketId
  }
  if(gameState == "menu"){
    console.log("gameState = " + gameState);
    serverMenuProcessor(socket, data);
  }else if(gameState == "game"){
    console.log("gameState = " + gameState);
    serverGameProcessor(socket, data);
  }
}

function serverMenuProcessor(socket, data){
  // var data = "placeholder"////temporary
  /// roomdata = current client room
  socket.emit('main menu');
  // socket.broadcast.emit('global', globalData);// emit without the sender
  io.sockets.emit('global data', data.totalPlayers, data.globalPlayers);//emit to all clients
  // socket.emit('room', rooms);
  socket.on('create room', function(roomName){
    processCreateRoom(socket, roomName)
  });

  socket.on('ready', function(){
    processPlayerReady(socket);
  });
  socket.on('proceed start game', function(){
    serverGeneralProcessor(socket, "game");
  });

}
//processCreateRoom(roomName);

function serverGameProcessor(socket, data){
  // socket.on('in game');
  // socket.emit("passId", socket.id);
  // socket.on('requestPassId', function(){
  //   // socket.emit("passId", socket.id);
  //   socket.broadcast.to(socket.id).emit("passId", socket.id);
  // });

  initGameStart(socket);
  // Responds to a movement event

  serverGameLogic(socket, data);
}


function processCreateRoom(socket, roomName){
  if(rooms[roomName] == undefined){
    socket.join(roomName);
    getRoomBySocketId[socket.id] = roomName;
    rooms[roomName] = giveEmptyRoomData(roomName);
    rooms[roomName].owner = socket.id;
    rooms[roomName].players[socket.id] = {
      ready : false,
    };
    rooms[roomName].players.numPlayers++;
    console.log("rooms[roomName]: " + rooms[roomName])
    console.log("LOGGING ROOMS", rooms[roomName]);
    io.to(roomName).emit('room data', rooms[roomName]);
    console.log("room owner: ", rooms[roomName].owner)
    console.log("player list in room", rooms[roomName].players)
  }else{
    // var warning = "Room has already been taken";
    // socket.emit('room data', warning);
    joinRoom(socket, roomName)
  }

}

function joinRoom(socket, roomName){
  if(rooms[roomName] != undefined){
    socket.join(roomName);
    getRoomBySocketId[socket.id] = roomName;
    rooms[roomName].players[socket.id] = {
      ready : false,
    };
    rooms[roomName].players.numPlayers++;
    io.to(roomName).emit('room data', rooms[roomName]);
    console.log("player list in room", rooms[roomName].players)
    console.log("first player in room", rooms[roomName].players[0])
  }else if(rooms[roomName].gameState == "game"){
    var warning = "Room currently in game";
    socket.emit('room data', warning);
  }else{
    var warning = "Room does not exist";
    socket.emit('room data', warning);
  }
}

function processDisconnect(socket){
  console.log('socket event disconnect called');
  console.log("globalPlayers.players", globalPlayers.players)
  globalPlayers.players.splice(socket.id, 1);
  totalPlayers--;
  console.log("\tglobalPlayers.players", globalPlayers.players)
  // var globalData = {totalPlayers, globalPlayers};
  // console.log("\tglobalData being sent: ", globalData)
  io.sockets.emit('global data', totalPlayers, globalPlayers);
  var roomName = getRoomBySocketId[socket.id];
  if(roomName != undefined){
    if (getRoomBySocketId == undefined
      || roomName == undefined
      || rooms[roomName] == undefined
      || rooms[roomName].players[socket.id] == undefined) {
        //if the socket id is not valid, ignore the disconnect signal
        console.log('invalid disconnect call: ignoring...')
        return;
      }
      removePlayerFromRoom(socket, roomName);
      if(rooms[roomName].players.numPlayers < 1){
        removeEmptyRoom(socket, roomName);
        console.log("rooms",rooms)
      }
  }
}

function initGameStart(socket){
  var roomName = getRoomBySocketId[socket.id];
  io.to(roomName).emit('in game');//, rooms[getRoomBySocketId[socket.id]]);// last change: only owner start game first but data not transmitted, game doesn't load bc missing data being emitted
  console.log("InitGameStart from player: " + socket.id + "\n\tat room: " + roomName);
  console.log("\trooms[roomName]: " + rooms[roomName])
  // socket.emit('level init', function(){// last change: initlevel == room owner, mapReady
  // console.log("level init")
  io.to(roomName).emit('refresh screen');
  socket.on('owner process map', function(){
    console.log("owner process map called")
    if(socket.id == rooms[roomName].owner){
      console.log("\troom owner process map")
      initLevel(socket, roomName);
      emitLevelInfo(socket, roomName);
      receiveMapImageSrcToServer(socket);
      // console.log("/////////////////////////////////new mapImage from owner", rooms[roomName].mapImageSrc, "////////////////////////////////////////////////////////")
      // sendMapImageEmitCount(socket, roomName);
      // sendMapProcessedSignal(socket, roomName);
    }
  });
  //

  socket.on('character creation', function(){
    createInGamePlayer(socket.id, roomName, socket.id);
    // socket.emit('game loop');
  });
  // setInterval(function() {
  //   for (var rm in rooms) {
  //     if(rooms[rm].gameState == "game" && rooms[rm].players.numPlayers > 0){
  //       console.log("Rooms[" + rm + "]: " + rooms[rm])
  //       console.log("Rooms[" + rm + "],players: " + rooms[rm].players)
  //       //  console.log("interval player")
  //       moveProjectiles(rm);
  //       moveEnemies(rm);
  //       handleBulletCollisions(rm);
  //       generateEnemies(rm);
  //       //console.log("LOGGING rm", rm);
  //       io.sockets.to(rm).emit('state', rooms[rm].players,
  //       rooms[rm].projectiles, rooms[rm].enemies);
  //     }
  //   }
  // }, 1000/120);
  console.log("in game data: " + rooms[roomName]);
  // });
}

function serverGameLogic(socket, data){
  // socket.on("requestMapImageSrcFromServer", function(){
  //   // console.log('imageSrc returned for request:', mapImageSrc);
  //   var roomData = rooms[getRoomBySocketId[socket.id]];
  //   // console.log('requestMapImageSrcFromServer called from ',socket.id);
  //   // console.log('---------deliver mapImageToClient', roomData.mapImageSrc,"------------------");
  //   // console.log('--------mapReady', roomData.mapReady,"------------------");
  //   socket.emit("deliverMapImageSrcToClient", roomData.mapImageSrc);//, roomData.mapReady);
  // });

  socket.on('movement', function(data) {
    // var player = players[socket.id] || {};
    // movePlayer(player, data);
    if (getRoomBySocketId == undefined
      || getRoomBySocketId[socket.id] == undefined) {
        console.log("Error processing movement getRoomBySocketId ", getRoomBySocketId,
         " and getRoomBySocketId[", socket.id, "] ", getRoomBySocketId[socket.id])
      return;
    }
    var player = rooms[getRoomBySocketId[socket.id]].players[socket.id] || {};
    movePlayer(player, data, getRoomBySocketId[socket.id]);
  });

  //Code block to respond to shooting
  socket.on('shoot', function(data) {
    if (data.shootBullet) {
      var rm = getRoomBySocketId[socket.id]
      // console.log("emit sound");
      // var sound = "bang";
      // socket.emit('sound', sound);
      generateProjectile(socket.id, data, rm);
    }
  });
  //Code block to respond to an interaction with the game environment
  socket.on('interact', function(data) {
    if (getRoomBySocketId == undefined
      || getRoomBySocketId[socket.id] == undefined) {
      return;
    }
    var player = rooms[getRoomBySocketId[socket.id]].players[socket.id] || {};
    //General interaction button
    if(data.interaction) {
      console.log("logging interaction data", data);
    }
    //Reload gun
    if(data.reload) {
      reloadGun(player);
    }
  });
}


function giveEmptyRoomData() {
  //Players object will contain all information about each player's position,
  var room = {}

room.players = {
  numPlayers: 0
};

//Projectiles object will keep track of active projectiles
room.projectiles = {
  numProjectiles: 0
}
room.bulletCount = 0;

//Enemies
room.enemies = {
  numEnemies: 0
}
room.enemyID = 0;

room.mapImageSrc = "";
room.mapData; // 2d array of the map

// when was the last object spawned
room.lastSpawn = -1;
room.spawnRate = 2000;

room.zones = {};

room.teamQuests = [
  {
    name: "Trapped on Mountain", //TODO: change after demo classroom decided!
    isMainQuest: true,
    isHidden: false,
    condition: "Go to the Avocado Garden",
    description: "The heart of the Special Fortification Unit",
    display: true,
    checkCondition: function(rm){
      var isComplete = true;
      for (var id in rooms[rm].players) {
        var player = rooms[rm].players[id];
        if (!player || !player.x) {
          continue;
        }
        if (!(player.x > 268*GRID_SIZE && player.x < 307*GRID_SIZE
          && player.y > 153*GRID_SIZE && player.y < 196*GRID_SIZE)) {
          isComplete = false;
        }
      }
      return isComplete;
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    complete: function(rm) {
      room = rooms[rm];
      var qNum; //index of this quest
      var player;

      //giving values to qNum, player, and quest.
      for (var id in room.players) {
        //just choose one player and break
        player = room.players[id];
        if (!player || !player.quests) {
          continue;
        }
        break;
      }
      for (var q in room.teamQuests) {
        if (room.teamQuests[q].name == "Trapped on Mountain") {
          qNum = q;
        }
      }
      var quest = room.teamQuests[qNum];

      //Complete ALL player's this quest, with scores for all.
      for (var id in room.players) {
        var otherPlayer = room.players[id];
        if (!otherPlayer) {
          continue;
        }
        if (!otherPlayer.quests) {
          console.log(otherPlayer);
          continue;
        }
        otherPlayer.score += 100;
        //trigger next quests
        for (var i = 0; i < quest.trigger.length; i++) {
          for (var nextQ in otherPlayer.quests) {
            if (otherPlayer.quests[nextQ].name == quest.trigger[i] && !otherPlayer.quests[nextQ].clear) {
              otherPlayer.quests[nextQ].display = true;
            }
          }
        }
      }
      io.sockets.to(rm).emit("message",
        "Welcome, player.");
      io.sockets.to(rm).emit("message",
        "I am Avocado,\nOwner of S.F.U.");
      io.sockets.to(rm).emit("message",
        "What story should I write here? \nGimme ideas @channel");
      io.sockets.to(rm).emit("message",
        "Anyway! Go to Rotunda. I will open up the space for you.");
      //construction mall open
      var constructionMallZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "Construction Mall") {
          constructionMallZoneNum = zoneNum;
          break;
        }
      }
      if (!room.zones[constructionMallZoneNum].open) {
        room.zones[constructionMallZoneNum].open = true;
        io.sockets.to(rm).emit("zoneOpen", "Avocado quest complete!");
      }
    },
    trigger: ["Combat Ready"]
  }];

return room
}

function processPlayerReady(socket){
  var roomName = getRoomBySocketId[socket.id];
  // var ready = rooms[roomName].players[socket.id].ready;
  if(rooms[roomName].players[socket.id].ready == undefined){
    console.log("ready undefined")
    rooms[roomName].players[socket.id].ready = true;
  }else if(rooms[roomName].players[socket.id].ready == true){
    console.log("ready true")
    rooms[roomName].players[socket.id].ready = false;
  }else{
    console.log("ready false")
    rooms[roomName].players[socket.id].ready = true;
  }
  console.log(socket.id + " ready: " + rooms[roomName].players[socket.id].ready)
  processStartGame(socket);
}

function processStartGame(socket){
  if(isGameStartable(socket)){
    var roomName = getRoomBySocketId[socket.id];
    io.to(roomName).emit('game startable');
  }
}

function isGameStartable(socket){
  var roomName = getRoomBySocketId[socket.id];
  var playerList = rooms[roomName].players;
  for(var player in playerList){
    if(!playerList[player].ready){
      return false;
    }else if(playerList[player].ready != true){
      console.log("Error in ready: " + player.ready)
      return false;
    }
  }
  return true;
}

function initLevel(socket, roomName){
  var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
  var processor = require('./static/objects/mapProcessor.js');
  console.log("----Inside Init level-----")
  console.log("roomName = " + roomName)
  console.log("rooms[roomName]: " + rooms[roomName])
  rooms[roomName].mapData = processor.constructFromData(mapDataFromFile);
  // console.log("\trooms[roomName].mapData: " + rooms[roomName].mapData)
  rooms[roomName].gameState = "game"
  //console.log(mapData);///////*******
}

function emitLevelInfo(socket, roomName){
  io.to(roomName).emit("grid size", GRID_SIZE);
  console.log("\tplayer list in room", rooms[roomName].players)
  // console.log("\tfirst player in room", rooms[roomName].players[0])
  console.log("\temit level info to ",rooms[roomName].owner)
  socket.emit('draw map', rooms[roomName].mapData);//change
  console.log('numPlayers: ', rooms[roomName].players.numPlayers, ', create map called');
}

function createInGamePlayer(id, roomName, uName) {
  rooms[roomName].players[id] = {
    playerID: rooms[roomName].players.numPlayers,
    username: uName,
    x: 259 * GRID_SIZE,
    y: 169 * GRID_SIZE,
    maxHealth: 20,
    health: 20,
    healthRecoverRate: 1,
    level: 1,
    damage: 5,
    speed: 3*50,
    score: 0,
    gun: "pistol",
    clip: 12,
    clipSize: 12,
    zone: 0,
    playerSocketId: id,
    questData: {
      bulletsTotal: 0,
      minHealth: 20,
      startTime: new Date(),
      q1Over: false,
      q2Over: false
    },
    quests: [
    {
      name: "Combat Ready",
      isMainQuest: false,
      isHidden: false,
      condition: "Shoot 30 times",
      description: "Ready for the fight?",
      display: false,
      checkCondition: function(player){
        return (player.questData.bulletsTotal >= 30);
      },
      clear: false,
      progress: function(player){
        return "("+player.questData.bulletsTotal+"/"+30+")";
      },
      progressText: "",
      trigger: []
    },
    {
      name: "Newbie survivor",
      isMainQuest: false,
      isHidden: false,
      condition: "Survive for 60 seconds",
      description: "Hey, you're stil alive!",
      display: true,
      checkCondition: function(player){
        var currentTime = new Date();
        return (currentTime - player.questData.startTime > 60*1000);
      },
      clear: false,
      progress: function(player){
        var currentTime = new Date();
        return "("+Math.round((currentTime-player.questData.startTime)/1000)+"/"+60+")";
      },
      progressText: "",
      complete: function(player) {

      },
      trigger: ["Experienced survivor"]
    },
    {
      name: "Experienced survivor",
      isMainQuest: false,
      condition: "Survive for 5 minutes",
      description: "Hey, you're stil alive!",
      display: false,
      checkCondition: function(player){
        var currentTime = new Date();
        return (currentTime - player.questData.startTime > 5*60*1000);
      },
      clear: false,
      progress: function(player){
        var currentTime = new Date();
        return "("+Math.round((currentTime-player.questData.startTime)/60000)+"/"+5+")";
      },
      progressText: "",
      complete: function(player) {

      },
      trigger: []
    }]
  };
}

function receiveMapImageSrcToServer(socket){
  socket.on("deliverMapImageSrcToServer", function(imageSrc){
    console.log('deliverMapImageSrcToServer called from ', socket.id);
    var roomName = getRoomBySocketId[socket.id];
    // mapImageSrc = imageSrc;
    rooms[roomName].mapImageSrc = imageSrc;
    rooms[roomName].mapImageEmitCount++;
    // console.log("received imageSrc ")// + imageSrc)
    io.to(roomName).emit("deliverMapImageSrcToClient", imageSrc);
    console.log("inside receive map for rooms[",roomName,"].mapImageSrc ",rooms[roomName].mapImageSrc)
  });
}

// function sendMapImageEmitCount(socket, roomName){
//   io.to(roomName).emit('map image emit count', rooms[roomName].mapImageEmitCount);
// }

function removePlayerFromRoom(socket, roomName){
  console.log("rooms[roomName].players[socket.id]", rooms[roomName].players[socket.id])
  delete rooms[roomName].players[socket.id];
  rooms[roomName].players.numPlayers -= 1;
  console.log("\trooms[roomName].players[socket.id]", rooms[roomName].players[socket.id])
  // logOutPlayer(rooms[roomName].players[socket.id].username);
}

function removeEmptyRoom(socket, roomName){
  console.log("rooms", rooms)
  delete rooms[roomName];
  console.log("rooms", rooms)
}
// function sendMapProcessedSignal(socket, roomName){
//   var roomData = rooms[getRoomBySocketId[socket.id]];
//   console.log('**********mapimnage After Initiated', roomData.mapImageSrc,"**************");
//   console.log('************ after mapReady', roomData.mapReady,"************");
  // io.to(roomName).emit('map processed');
// }

function moveProjectiles(rm) {
  for (var id in rooms[rm].projectiles) {
    if (rooms[rm].projectiles[id]) {
      var delBullet = false;
      var originX = rooms[rm].projectiles[id].x;
      var originY = rooms[rm].projectiles[id].y;
      rooms[rm].projectiles[id].x += rooms[rm].projectiles[id].vx/updatePerSecond;
      rooms[rm].projectiles[id].y += rooms[rm].projectiles[id].vy/updatePerSecond;
      if(hasCollision(rooms[rm].projectiles[id].x, rooms[rm].projectiles[id].y, rm)){
        rooms[rm].projectiles[id].x = originX;
        rooms[rm].projectiles[id].y = originY;
        delBullet = true;
        // deleteBullet(id);
      }
      //Delete stale projectiles
      if ( (Math.abs(rooms[rm].projectiles[id].x) > 5000) ||
           (Math.abs(rooms[rm].projectiles[id].y) > 5000) ) {
          delBullet = true;
      }
      if(delBullet == true){
        deleteBullet(id, rm);
      }
    }
  }
}

function movePlayer(player, data, rm) {
  //Modified the values here to reflect player speed - GG 2019.10.26 17:30
  var originX = player.x;
  var originY = player.y;
  //console.log(player.x + ", " + player.y)////*****
  if (data.left) {
    player.x -= player.speed/updatePerSecond;
  }
  if (data.up) {
    player.y -= player.speed/updatePerSecond;
  }
  if (data.right) {
    player.x += player.speed/updatePerSecond;
  }
  if (data.down) {
    player.y += player.speed/updatePerSecond;
  }
  if(player != undefined){
    if(hasCollision(player.x, player.y, rm)){
      player.x = originX;
      player.y = originY
    }

    //zone change check
    if (player.zone == 0
      || (rooms[rm].zones[player.zone] != undefined
        && !rooms[rm].zones[player.zone].inside(player.x/GRID_SIZE,
          player.y/GRID_SIZE))) {
      var newZone = 0;
      for (zoneNum in rooms[rm].zones) {
        if (rooms[rm].zones[zoneNum].inside(player.x/GRID_SIZE,
          player.y/GRID_SIZE)) {
          player.zone = zoneNum;
          io.sockets.to(player.playerSocketId).emit("zoneChange", zoneNum);
          newZone = zoneNum;
        }
      }
      if (newZone == 0) {
        player.zone = 0;
      }
    }

  }
}

function hasCollision(x, y, rm){
  var gridX = Math.floor(x / GRID_SIZE);
  var gridY = Math.floor(y / GRID_SIZE);
  for (zoneNum in rooms[rm].zones) {
    if (!rooms[rm].zones[zoneNum].open
      && rooms[rm].zones[zoneNum].inside(gridX, gridY)) {
      return true;
    }
  }
  if(rooms[rm] == undefined || rooms[rm].mapData == undefined
    || rooms[rm].mapData[gridX] == undefined
    || rooms[rm].mapData[gridX][gridY] == undefined) {
    // console.log("collision " + gridX + ", " + gridY)
    return false;
  } else if(rooms[rm].mapData[gridX][gridY].collision == true){
    // console.log("collision " + gridX + ", " + gridY)
    return true;
  }
  return false;
}

function deleteBullet(id, rm) {
  var temp = rooms[rm].projectiles[rooms[rm].bulletCount -= 1];
  rooms[rm].projectiles[rooms[rm].bulletCount] = rooms[rm].projectiles[id];
  rooms[rm].projectiles[id] = temp;
  rooms[rm].projectiles[rooms[rm].bulletCount] = 0;
  rooms[rm].projectiles.numProjectiles -= 1;
}

function moveEnemies(rm) {
  //Enemy movement handler
  for (var id in rooms[rm].enemies) {
   //Find closest players
   if ( rooms[rm].players.numPlayers > 0 ) {
   // if ( (players.players.numPlayers > 0) && (numEnemies > 0) ) {
     var closestPlayer;
     var closestPlayerDistance = Infinity;
     for (var player in rooms[rm].players) {
       var distX = rooms[rm].players[player].x - rooms[rm].enemies[id].x;
       var distY = rooms[rm].players[player].y - rooms[rm].enemies[id].y;
       var distance = Math.sqrt( distX * distX + distY * distY );
       if (distance < closestPlayerDistance) {
         closestPlayer = player;
         closestPlayerDistance = distance;
       }
     }
     if (rooms[rm].players[closestPlayer] == undefined) {
       // console.log("players[closestPlayer] is undefined. Ignoring",
       //   "moveEnemies() logic instead of letting program crash.",
       //   "Please check the logic.");
       return;
     }
     //Move to closest player
     distX = rooms[rm].enemies[id].x - rooms[rm].players[closestPlayer].x;
     distY = rooms[rm].enemies[id].y - rooms[rm].players[closestPlayer].y;

     var attackTheta = Math.atan(distX / distY);

     var sign = -1;
     if (rooms[rm].enemies[id].y < rooms[rm].players[closestPlayer].y) {
       sign = 1;
     }

     if ( Math.abs(distX) < 15 && Math.abs(distY) < 15 ) {
      // console.log("distX ", distX, "distY, ", distY);
      //Deplete health
      rooms[rm].players[closestPlayer].health -= 8/updatePerSecond;
      //Kill player
      if (rooms[rm].players[closestPlayer].health < 0) {
        youveBeenTerminated(closestPlayer, rm);
        // break;
        if (rooms[rm] == undefined) {
          return;
        }

      }

       //Dont move any closer
       sign = 0;
     }

     rooms[rm].enemies[id].vx =  rooms[rm].enemies[id].speed * Math.sin(attackTheta) * sign;
     rooms[rm].enemies[id].vy =  rooms[rm].enemies[id].speed * Math.cos(attackTheta) * sign;
     var originX = rooms[rm].enemies[id].x;
     var originY = rooms[rm].enemies[id].y;
     rooms[rm].enemies[id].x += rooms[rm].enemies[id].vx/updatePerSecond;
     rooms[rm].enemies[id].y += rooms[rm].enemies[id].vy/updatePerSecond;
     if(hasCollision(rooms[rm].enemies[id].x, rooms[rm].enemies[id].y, rm)){
       rooms[rm].enemies[id].x = originX;
       rooms[rm].enemies[id].y = originY;
     }
   }
 }
 if (rooms[rm] == undefined) {
   return;
 }
}

function handleBulletCollisions(rm) {
  //Player-projectile collision handler
  for (var player in rooms[rm].players) {
    for (var id in rooms[rm].projectiles) {
      if (rooms[rm].projectiles[id]) {
        if ( (Math.abs(rooms[rm].players[player].x - rooms[rm].projectiles[id].x) < 2) &&
            (Math.abs(rooms[rm].players[player].y - rooms[rm].projectiles[id].y) < 2) ) {
          rooms[rm].players[player].health -= 1;
          if (rooms[rm].players[player].health < 0) {
            youveBeenTerminated(player, rm);
          }
        }
      }
    }
  }
  //Enemy-projectile collision handler
  for (var enemy in rooms[rm].enemies) {
    for (var id in rooms[rm].projectiles) {
      if (rooms[rm].projectiles[id]) {
        if ( (Math.abs(rooms[rm].enemies[enemy].x - rooms[rm].projectiles[id].x) < 5) &&
            (Math.abs(rooms[rm].enemies[enemy].y - rooms[rm].projectiles[id].y) < 5) ) {
              rooms[rm].enemies[enemy].health -= 1;
              if (rooms[rm].enemies[enemy].health < 0) {
                var temp = rooms[rm].enemies[rooms[rm].enemyID -= 1];
                rooms[rm].enemies[rooms[rm].enemyID] = rooms[rm].enemies[enemy];
                rooms[rm].enemies[enemy] = temp;
                rooms[rm].enemies[rooms[rm].enemyID] = 0;
                rooms[rm].enemies.numEnemies -= 1;
              }
        }
      }
    }
  }
}

function generateEnemies(rm) {
  // spawn a new object
  if (rooms[rm].spawnRate > 1000) {
    rooms[rm].spawnRate = rooms[rm].spawnRate -= 1;
  }
  // get the elapsed time
  var time = Date.now();

  // see if its time to spawn a new object
  if (time > (rooms[rm].lastSpawn + rooms[rm].spawnRate)) {
    rooms[rm].lastSpawn = time;
    spawnRandomObject(rm);
    //console.log('emeny spawned. spawnRate: ', spawnRate);
  }
}

function generateProjectile(id, data, rm) {
  //Don't shoot if the room doesnt exist
  if (!rooms[rm]) {
    console.log("Room does not exist, cannot create projectile.");
    return;
  }
  //Don't shoot if player is out of clip
  if (!rooms[rm].players[id].clip) {
    return;
  }
  rooms[rm].players[id].questData.bulletsTotal += 1;
  rooms[rm].projectiles.numProjectiles++;

  //Calculate projectile trajectory
  mouseX = data.x;
  mouseY = data.y;
  playerX = rooms[rm].players[id].x - data.middleX;
  playerY = rooms[rm].players[id].y - data.middleY;
  rooms[rm].players[id].clip -= 1;

  dx = mouseX - playerX;
  dy = mouseY - playerY;

  theta = Math.atan(dx / dy);

  velX = rooms[rm].players[id].speed * Math.sin(theta);
  velY = rooms[rm].players[id].speed * Math.cos(theta);
  if (dy < 0) {
    velY *= -1;
    velX *= -1;
  }

  //Generate the projectile
  rooms[rm].projectiles[rooms[rm].bulletCount] = {
    x: rooms[rm].players[id].x + (3 * velX/updatePerSecond),
    y: rooms[rm].players[id].y + (3 * velY/updatePerSecond),
    vx: velX,
    vy: velY
  };
  rooms[rm].bulletCount++;

  //reset bullet count if too high
  if (rooms[rm].bulletCount > 100) {
    spawnRandomObjectbulletCount = 0;
  }
}


function spawnRandomObject(rm) {
    // About Math.random()
    // Math.random() generates a semi-random number
    // between 0-1. So to randomly decide if the next object
    // will be A or B, we say if the random# is 0-.49 we
    // create A and if the random# is .50-1.00 we create B
    spawnX = Math.random() * 350 + 1600;
    spawnY = Math.random() * 350 + 1600;

    while(hasCollision(spawnX, spawnY, rm)) {
      spawnX = Math.random() * 350 + 1600;
      spawnY = Math.random() * 350 + 1600;
    }
    // add the new object to the objects[] array
    if (rooms[rm].enemies.numEnemies < 1) {
      rooms[rm].enemies[rooms[rm].enemyID] = {
        // type: t,
        // set x randomly but at least 15px off the canvas edges
        x: spawnX,
        // set y to start on the line where objects are spawned
        y: spawnY,
        vx: 5,
        vy: 5,
        speed: .8*50,
        health: 4,
        maxHealth: 4
      }
      rooms[rm].enemies.numEnemies++;
      rooms[rm].enemyID++;
    }
}

function reloadGun(player) {
  player.clip = player.clipSize;
}

function recoverPlayerHealth(rm) {
  for (var id in rooms[rm].players) {
    var player = rooms[rm].players[id];
    if (player.health < player.maxHealth) {
      player.health += player.healthRecoverRate/updatePerSecond;
      if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
      }
    }
  }
}

function checkQuest(rm) {
  for (var qNum in rooms[rm].teamQuests) {
    if (!rooms[rm].teamQuests[qNum].clear && rooms[rm].teamQuests[qNum].display) {
      var quest = rooms[rm].teamQuests[qNum];
      rooms[rm].teamQuests[qNum].progressText = quest.progress(player);
      if (quest.checkCondition(rm)) {
        //quest complete!
        rooms[rm].teamQuests[qNum].clear = true;
        rooms[rm].teamQuests[qNum].display = false;
        //trigger next quests
        for (var i = 0; i < quest.trigger.length; i++) {
          for (var nextQ in rooms[rm].teamQuests) {
            if (rooms[rm].teamQuests[nextQ].name == quest.trigger[i] && !rooms[rm].teamQuests[nextQ].clear) {
              rooms[rm].teamQuests[nextQ].display = true;
              continue;
            }
          }
          for (var id in rooms[rm].players) {
            var player = rooms[rm].players[id];
            for (var nextQ in player.quests) {
              if (player.quests[nextQ].name == quest.trigger[i] && !player.quests[nextQ].clear) {
                player.quests[nextQ].display = true;
                continue;
              }
            }
          }
        }
        quest.complete(rm);
        console.log("***first main quest complete!!!***");
        io.sockets.to(rm).emit("questOver", quest.name, quest.condition, quest.description);
      }
    }
  }

  //checking quest conditions! This part will be very hard to refactor, don't try....
  for (var id in rooms[rm].players) {
    var player = rooms[rm].players[id];

    if (player == undefined || player.questData == undefined) {
      continue;
    }
    for (var qNum in player.quests) {
      if (!player.quests[qNum].clear && player.quests[qNum].display) {
        var quest = player.quests[qNum];
        player.quests[qNum].progressText = quest.progress(player);
        if (quest.checkCondition(player)) {
          //quest complete!
          player.quests[qNum].clear = true;
          player.quests[qNum].display = false;
          //trigger next quests
          for (var i = 0; i < quest.trigger.length; i++) {
            for (var nextQ in rooms[rm].teamQuests) {
              if (rooms[rm].teamQuests[nextQ].name == quest.trigger[i] && !rooms[rm].teamQuests[nextQ].clear) {
                rooms[rm].teamQuests[nextQ].display = true;
                continue;
              }
            }
            for (var nextQ in player.quests) {
              if (player.quests[nextQ].name == quest.trigger[i] && !player.quests[nextQ].clear) {
                player.quests[nextQ].display = true;
                continue;
              }
            }
          }
          quest.complete(player);
          io.sockets.to(id).emit("questOver", quest.name, quest.condition, quest.description);
        }
      }
    }
  }
}

function youveBeenTerminated(player, rm) {
  rooms[rm].players[player] = 0;
  console.log(rooms[rm].players[player]);
  rooms[rm].players.numPlayers -= 1;

  if (rooms[rm].players.numPlayers <= 0) {
    console.log("room deleted: number of players ", rooms[rm].players.numPlayers);
    delete rooms[rm];
  }
  //Load "YOUVE FAILED SCREEN"
}

//Loads the you've failed screen
function youFailed(player, rm) {

}

function aStarSearch(startState, goal, rm) {
  var explored = [];
  var parents = {};
  var fringe = new PriorityQueue();

  startState = [startState, [], 0];
  fringe.push( [[startState, 0], 0] );

  // Perform search by expanding nodes based on the sum of their current
  // path cost and estimated cost to the goal, as determined by the heuristic
  while(fringe.isEmpty() == false) {
    var state = fringe.pop();
    var current = state[0];
    current = current[0];
    if (explored.find( function(item) {
        return ( (current[0][0] == item[0]) && current[0][1] == item[1]) }))
    {
      continue;
    }
    else {
      explored.push(current[0]);
    }

    //Goal check
    if (isGoalState(current[0], goal)) {
      return makeList(parents, current);
    }

    //Expand new successors
    successors = getSuccessors(current[0], rm);
    for (successor in successors) {
      // if(successors = [0,0,0,0]) {
      //   console.log("successors", successors)
      //   console.log("A* path got stuck");
      //   break;
      // }
      if(successors[successor] == 0) {
        console.log("successors", successors);
        console.log("collision detected", successor);
        continue;
      }
      expandedState = successors[successor];
      stateCoords = expandedState[0]
      if (!explored.find( function(item) {
          return ((stateCoords[0] == item[0]) && (stateCoords[1] == item[1]) ) }))
      {
        parents[expandedState] = current;
        fringe.push([ [expandedState, state[1] + expandedState[2]],
        manhattanHeuristic(expandedState[0], goal) + state[1] + expandedState[2] ]);
      }
    }
  }
  return [];
}

//Return successors of state
//Modify this to avoid walls
function getSuccessors(state, rm) {
  //Use 5 as arbitraty number
  stateL = [[state[0] - (1 * GRID_SIZE), state[1]], "left", 1];
  // stateL = [[state[0] - (5), state[1]], "left", 1];
  console.log(rm);
  if(hasCollision(stateL[0], stateL[1], rm)) {
    console.log("has collision");
    stateL = 0;
  }

  stateR = [[state[0] + (1 * GRID_SIZE), state[1]], "right", 1];
  // stateR = [[state[0] + (5), state[1]], "right", 1];
  if(hasCollision(stateR[0], stateR[1], rm)) {
    console.log("has collision");
    stateR = 0
  }

  stateU = [[state[0], state[1] - (1 * GRID_SIZE)], "up", 1];
  // stateU = [[state[0], state[1] - (5)], "up", 1];
  if(hasCollision(stateU[0], stateU[1], rm)) {
    console.log("has collision");
    stateU = 0
  }

  stateD = [[state[0], state[1] + (1 * GRID_SIZE)], "down", 1];
  // stateD = [[state[0], state[1] + (5)], "down", 1];
  if(hasCollision(stateD[0], stateD[1], rm)) {
    console.log("has collision");
    stateD = 0
  }

  var states = [stateL, stateR, stateU, stateD];
  return states;
}

//Return true if goal state at state
function isGoalState(state, goal) {
  goalx = Math.floor(goal[0] / (1 * GRID_SIZE));
  goaly = Math.floor(goal[1] / (1 * GRID_SIZE));
  statex = Math.floor(state[0] / (1 * GRID_SIZE));
  statey = Math.floor(state[1] / (1 * GRID_SIZE));

  if ( (goalx == statex) && (goaly == statey) ) {
    return true;
  }
  else {
    return false;
  }
}

//Return the manhattan distance between position and goal
function manhattanHeuristic(position, goal) {
  // console.log("position", position, "goal", goal);
  var xy1 = [(position[0] / (1 * GRID_SIZE)), (position[1] / (1 * GRID_SIZE))];
  var xy2 = [(goal[0] / (1 * GRID_SIZE)), (goal[1] / (1 * GRID_SIZE))];
  return Math.abs(xy1[0] - xy2[0]) + Math.abs(xy1[1] - xy2[1]);
}

//Find/return position of player closest to enemy
function closestPlayerXY(rm, enemy) {
  if (rooms[rm].players.numPlayers > 0) {
      var closestPlayer;
      var closestPlayerDistance = Infinity;
      for (var player in rooms[rm].players) {
        var distance = manhattanHeuristic([enemy.x, enemy.y], [player.x, player.y]);
        if (distance < closestPlayerDistance) {
          closestPlayer = player;
          closestPlayerDistance = distance;
        }
      }
      if (rooms[rm].players[closestPlayer] == undefined) {
        console.log("players[closestPlayer] is undefined. Ignoring",
          "moveEnemies() logic instead of letting program crash.",
          "Please check the logic.");
        return;
      }
  return [closestPlayer.x, closestPlayer.y];
  }
}

//Return the path to players position
function makeList(parents, goal) {
  console.log("making path");
  var path = [];
  while (goal[1] != [] && parents[goal]) {
    path.push(goal[1]);
    goal = parents[goal];
  }

  return path.reverse();
}

function testAstar(rm) {
  if (!rooms[rm] || rooms[rm].numplayers <= 0) {
    return;
  }
  if (!rooms[rm].players) {
    return;
  }
  for (var playerID in rooms[rm].players) {
    player = rooms[rm].players[playerID];
  }
  console.log(rooms[rm].enemies);
  for (var id in rooms[rm].enemies) {
    console.log("running A*");
    enemy = rooms[rm].enemies[id];
    var path = aStarSearch( [enemy.x, enemy.y], [player.x, player.y], rm );
    console.log("Astar generated path: ", path);
    return;
  }
}

//Sets a disconnecting players online status to false
function logOutPlayer(uname) {
  console.log(`Logging out ${uname}`);
  pool.query(
  'SELECT online FROM account WHERE username=$1',[uname], (error,results)=>{
    if (error) {
      throw(error);
    }

    var result = (results.rows == '') ? '':results.rows[0].online;
      //Upade online status
      pool.query(
        'UPDATE account SET online = false WHERE username=$1',[uname], (error,results)=>{
          if (error) {
            throw(error);
          }
      });
    // console.log(`Succesfully logged out ${uname}`);
  });
}

//=========================================================================================
// Testing functions

function returnRooms(){
  return rooms;
}

function returnProjectiles(serverName) {
  return rooms[serverName].projectiles
}

//=============================================================================
// Long Workpace
//Parse URL-encoded bodies (sent by HTML form)
app.use(express.urlencoded({extended:false}));
//Parse JSON body( sent by API client)
app.use(express.json());

//home page
app.get('/', function(request, response)
{
   var message ={'message':''};
   response.render('pages/login',message);
});

//Login function
app.post('/checkAccount', (request, response)=>{
  var uname = request.body.username;
  var pw = request.body.password;

  //Admin user
  if (uname == "ADMIN301254694") {
    pool.query('SELECT password FROM account WHERE username=$1',[uname], (error,results)=>{
      if (error) {
        throw(error);
      }
      //Check for password match
      var result = (results.rows == '') ? '':results.rows[0].password;
      if (result == String(pw)) {
        //Password matched, extract all table information
        pool.query("SELECT * FROM account;", (error,results) => {
          if (error) {
            throw(error);
          }
          var results = {'rows': results.rows };
          response.render('pages/admin', results);
        });
      }
      //Password does not match
      else {
        var message ={'message':'Account is not existing'};
        response.render('pages/login', message);
      }
    });
  }
  else {
   pool.query(
     'SELECT password, online FROM account WHERE username=$1',[uname], (error,results)=>{
       if (error)
       {
         throw(error);
       }

       var result = (results.rows == '') ? '':results.rows[0].password;
       if (result == String(pw))
       {
         //If user already online, reject login attempt
         if (results.rows[0].online) {
          console.log("Redundant login attempt for user $1", [uname]);
          var message ={'message':'Account is already logged in!'};
          response.render('pages/login',message);
         }
         var user = {'username':uname};

        //Upade online status
        pool.query(
          'UPDATE account SET online = true WHERE username=$1',[uname], (error,results)=>{
            if (error)
            {
              throw(error);
            }
        });
        //Log in user
        // response.render('pages/index', user);
        response.render('pages/index', user);
       }
       else {
        var message ={'message':'Account is not existing'};
        response.render('pages/login', message);
       }
     });
  }
});

//Cheking gmail data with database
app.post('/gglogin', (request, response)=>{
  const uname = request.body.username;
  const gmail=request.body.gmail;
  const searchQuery = "SELECT * FROM account WHERE gmail=$1";
  pool.query(searchQuery,[gmail], (error,results) =>{
    if (error){
      throw(error);
    }
    if (results.rows!='')
    {
      if (results.rows[0].username != uname)
      {
        var message = 'Gmail is used';
        response.render('pages/login',message);
      }
    }
    if (results.rows=='')
    {
      console.log('Creating new account with Google');
      const createQuery = "INSERT INTO account (username,gmail) VALUES($1,$2)";
      pool.query(createQuery,[uname,gmail], (error,results)=>{
      if (error)
        throw(error);
      });
    }
    response.end();
  });

});
//Login with gmail
app.post('/ggAccount',(request,response)=>
{
  const uname = request.body.username;
  const user = {
    'username':uname
  };
  const query = "SELECT * FROM account WHERE username =$1";
  pool.query(query,[uname],(error, results)=>{
    if (error)
      throw (error);
    if (results.rows[0].online)
    {
      console.log("Redundant login attempt for user $1", [uname]);
      var message ={'message':'Account is already logged in!'};
     response.render('pages/login',message);
      // response.send(uname+ ' is online already');
    }
    else
      {
        //Upade online status
        pool.query(
          'UPDATE account SET online = true WHERE username=$1',[uname], (error,results)=>{
            if (error)
            {
              throw(error);
            }
        });
       response.render('pages/index',user);
        // response.send('Login successfully for'+uname);
      }
  });

});

//sign-up page
app.get('/register', function(request,response)
{
  var message ={'message':''};
  response.render('pages/register',message);
});

app.post('/register', (request,response)=>{
   const uname = request.body.username;
   const pw = request.body.pw;
   const gmail = request.body.gmail;

   //Check username availability
   console.log('CHECKING USERNAME');
   var text = `SELECT * FROM account WHERE username='${uname}';`;
   pool.query(text,(error,results)=>{
     if (error){
       throw (error);
     }
     else {
       var result = {'rows': results.rows};
       if (result.rows.length !=0)
       {
         var message = {'message':'Username is used'};
         console.log('USERNAME IS USED');
         response.render('pages/register',message);
       }
       else {
         console.log('USERNAME CHECKED');
         //Check gmail availability
         console.log('CHECKING GMAIL');
         var text = `SELECT * FROM account WHERE gmail='${gmail}';`;
         pool.query(text,(error, results)=>{
           if (error){
             throw(error);
           }
           else {
             var result2 = {'rows': results.rows};
             if (result2.rows.length !=0)
             {
               var message = {'message':'Gmail is used'}
               console.log('GMAIL IS USED');
               response.render('pages/register',message);
             }
             else {
               console.log('GMAIL CHECKED');
               console.log('INSERTING...')
               var text = `INSERT INTO account (username, password, gmail)
                 VALUES ('${uname}','${pw}','${gmail}');`;
               pool.query(text, (error, results) =>{
                 if (error){
                   response.end(error);
                 };
                 console.log("INSERT ACCOUNT COMPLETED");
                 var message = {'message':'Sign-up Completed'};
                 response.render('pages/login',message)
               });
             };
           };
         });
       }
     };
   });
});
//=============================================================================

//=============================================================================
// George Workpace
app.post('/logout', (request, response)=>{
  console.log("logging username on logout request", request.body.username);
  logOutPlayer(request.body.username);
  response.render('pages/login', {'message':'Please play again!'} );
});

app.post('/gameroom', (request, response)=>{
  var data = {"server": request.body.roomName, "user": request.body.uname};
  console.log("logging results", data)
  response.render('pages/index', data);
});
