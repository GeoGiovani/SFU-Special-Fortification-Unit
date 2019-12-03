/* ============================CODE WRITING RULES==============================
 *
 * Our objective is to write CLEAN, well written code. Please follow these
 * basic guidelines:
 *
 *       1) Line width will be set to 80 chars. Lines of code longer than this
 *          will be divided up across multiple lines.
 *
 *          link to how to set character line rules in VSCODE:
 *          https://tinyurl.com/y2skbpbk
 *
 *       2) Variable naming will be in camelCase. Use good variable names.
 *
 *       3) DOCUMENT changes. If you refactor a line of code, document exactly
 *          what was done to change it, and initial/date the change.
 *
 *       4) Keep spacing consistent, such as indentations and parenthesis
 *          positioning.
 *
 *       5) Put a comment above EVERY function declaration describing its
 *          purpose.
 *
 * ==========================================================================*/
// Testing with mocha and chai
// adding export so that the function can be accessed by indexTest.js
module.exports = {
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
  //Tests that createRoom() creates a room with name serverName
  createRoom: function(serverName) {
    createRoom(serverName);
    return returnRooms();
  },
  //Tests that createRoom() correctly handles a request to make duplicate room
  createTwoRooms: function(serverName) {
    createRoom(serverName);
    createRoom(serverName);
    return returnRooms();
  },
  //Tests that createlayer() correctly creates a player with ID socketID inside
  //the room serverName
  createPlayer: function(socketID, serverName, username) {
    createRoom(serverName);                        //Create a room
    createPlayer(socketID, serverName, username);  //Create player within room
    return returnRooms();
  },
  //Test player movement
  testMovePlayer: function(socketID, serverName, username, directionData) {
    // createRoom(serverName);                        //Create a room
    createPlayer(socketID, serverName, username);  //Create a player for moving
    player = rooms[serverName].players[socketID];
    origin = [player.x, player.y];                 //Player's starting position

    movePlayer(player, directionData, serverName); //Move the player
    result = [player.x, player.y];                 //Position player moved to
    return { "start" : origin, "end" : result, "speed" : player.speed };
  },

  //Test player-wall collisions
  testCollision: function(socketID, serverName, username, directionData) {
    createRoom(serverName);
    createPlayer(socketID, serverName, username);
    player = rooms[serverName].players[socketID]
    for (i = 0; i < 200; i++) {
      movePlayer(player, directionData, serverName);
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
    return hasCollision((player.x + ddx), (player.y + ddy), serverName);
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
  testSpawn: function(rm) {
    createRoom(rm);
    var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
    var processor = require('./static/objects/mapProcessor.js');
    rooms[rm].mapData = processor.constructFromData(mapDataFromFile);
    rooms[rm].zones = processor.constructZone(mapDataFromFile);
    spawnEnemies(rm);

    var enemySuccessfullySpawns = 0
    console.log("logging the room's enemies", rooms[rm].enemies);
    if(rooms[rm].enemies) {
      enemySuccessfullySpawns = 1
    }
    return enemySuccessfullySpawns;
  },

  // Tests Enemy Movements
  testEnemyMovement: function(){
    enemyMove = 5;
    // enemies = generateEnemies();
    // enemyMove = moveEnemies(enemies);
    return enemyMove;
  },

  // Tests Player Shoot
  testPlayerShoot: function(){
    shoot = 0;
    return shoot;
  },

  // Tests Player Ammo
  testPlayerAmmo: function(){
    ammo = 12;
    return ammo;
  },

  // Tests Player Health
  testPlayerHealth: function(){
    health = 100;
    return health;
  },

  // Tests Player Reload
  testPlayerReload: function(){
    reload = 5;
    return reload;
  },

  // Tests Mini Map
  testMiniMap: function(){
    minimap = 2;
    return minimap;
  },

  // Test Enemy Spawn Zone 1
  testZone1: function(){
    zone1 = 1;
    return zone1;
  },

  // Tests Weather API
  testWeatherAPI: function(){
    weather = 1;
    return 1;
  },

  // Test that the boss spawns
  testBossSpawn: function(rm) {
    createRoom(rm);
    releaseTheBeast(rm);
    return(rooms[rm].boss);
  },

  // Test spawn zones
  testZones: function(socketID, rm) {
    createRoom(rm);
    //Load map data
    var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
    var processor = require('./static/objects/mapProcessor.js');
    rooms[rm].mapData = processor.constructFromData(mapDataFromFile);
    rooms[rm].zones = processor.constructZone(mapDataFromFile);

    createPlayer(socketID, rm, "Room");

    //Each of the below coordinates marks a zone on the map
    zoneList = [[1980, 1555], [2600, 1470], [3500,1400], [2675, 1260],
    [4005, 2460], [2600, 2330], [1955, 2045], [1765, 1740], [1075, 1655]];
    resultList = [];

    for (id in zoneList) {
      zone = zoneList[id];
      rooms[rm].players[socketID].x = zone[0];
      rooms[rm].players[socketID].y = zone[1];

      player = rooms[rm].players[socketID];
      for (zoneNum in rooms[rm].zones) {
        if (rooms[rm].zones[zoneNum].inside(player.x/10, player.y/10)) {
          rooms[rm].players[socketID].zone = zoneNum;
          resultList.push(rooms[rm].players[socketID].zone);
        }
      }
    }
    return resultList;
  },

  duplicateRooms: function(rm) {
    createRoom(rm);
    createRoom(rm);
    //Will crash if unsuccessfull
    return 1;
  },

  nearDeathCheck: function() {
    createRoom("nearDeathRoom");
    createPlayer("nearDeathID", "nearDeathRoom", "uname");
    youveBeenTerminated("nearDeathID",  "nearDeathRoom");
    return(rooms["nearDeathRoom"].players["nearDeathID"]);
  }

  // checkPlayerDisconnect: function() {
  //   createRoom("disconnectRoom");
  //   createPlayer("disconnectID", "disconnectRoom", "uname");
  //   logOutPlayer("uname")
  // }
}
// Dependencies
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

app.use('/static', express.static(__dirname + '/static'));// Ring
//
app.get('/', function(request, response) {
// response.sendFile(path.join(__dirname, 'index.html'));
 var user = {'username':'uname'};
 response.render('pages/matchmaking', user);
});// Starts the server.
//
server.listen(PORT, function() {
console.log('Starting server on port 5000');
});

//setting up default viewpath to views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Looking for static files in public folder
app.use(express.static(path.join(__dirname, 'public')));

const GRID_SIZE = 10; // each grid size for map

//Game rooms
var rooms = {};
var getRoomBySocketId = {};

//Creates a new player and puts them into the gane room specified by serverName
io.on('connection', function(socket) {
socket.emit('grid-size', GRID_SIZE);
socket.on('new player', function(username, servername) {
  console.log("data.server: ", servername);
  if (servername == undefined) {
    servername = "STUB";
  }
  //client who called the 'new player' joins the server 'serverName'.
  console.log('socket event new player called');
  console.log("Logging Game Room Name", servername)
  socket.join(servername);
  getRoomBySocketId[socket.id] = servername;

  //This condition is commented out because the 'disconnect' event is
  //commented out too. 'disconnect' is having multiple-call problem and
  //causing error for map-loading.
  //if (players.numPlayers < 4) {
  if(rooms[servername] == undefined) {
    createRoom(servername); //TODO
  }
  createPlayer(socket.id, servername, username);
  socket.emit("passId", socket.id);
});

//socket on functions for ID, Map, etc.
socket.on('requestPassId', function(){
  // socket.emit("passId", socket.id);
  socket.broadcast.to(socket.id).emit("passId", socket.id);
});
socket.on("deliverMapImageSrcToServer", function(imageSrc){
  //console.log('deliverMapImageSrcToServer called');
  // mapImageSrc = imageSrc;
  rooms[getRoomBySocketId[socket.id]].mapImageSrc = imageSrc;
});
socket.on("requestMapImageSrcFromServer", function(){
  // console.log('imageSrc returned for request:', mapImageSrc);
  // console.log('requestMapImageSrcFromServer called');
  socket.emit("deliverMapImageSrcToClient", mapImageSrc);
});

// Responds to a movement event
socket.on('movement', function(data) {
  // var player = players[socket.id] || {};
  // movePlayer(player, data);
  if (getRoomBySocketId == undefined
    || getRoomBySocketId[socket.id] == undefined) {
    return;
  }
  var player = rooms[getRoomBySocketId[socket.id]].players[socket.id] || {};
  movePlayer(player, data, getRoomBySocketId[socket.id]);
});

//Code block to respond to shooting
socket.on('shoot', function(data) {
  if (data.shootBullet) {
    var rm = getRoomBySocketId[socket.id]

    for (id in rooms[rm].players) {
      player = rooms[rm].players[id];
    }
    //astar testing here
    // console.log(aStarSearch([100,100], [200,200], rm));

    // if (rooms[rm]) {
    //   testAstar(rm);
    // }


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

//Removes disconnected player
socket.on('disconnect', function() {
    //Collects client data at 60 events/second
  console.log('socket event disconnect called');
  if (getRoomBySocketId == undefined
    || getRoomBySocketId[socket.id] == undefined
    || rooms[getRoomBySocketId[socket.id]] == undefined
    || rooms[getRoomBySocketId[socket.id]].players[socket.id] == undefined) {
    //if the socket id is not valid, ignore the disconnect signal
    console.log('invalid disconnect call: ignoring...')
    return;
  }
  //players[socket.id] = 0;
  logOutPlayer(rooms[getRoomBySocketId[socket.id]].players[socket.id].username);
  delete rooms[getRoomBySocketId[socket.id]].players[socket.id];
  rooms[getRoomBySocketId[socket.id]].players.numPlayers -= 1;
  if (rooms[getRoomBySocketId[socket.id]].players.numPlayers <= 0) {
    delete rooms[getRoomBySocketId[socket.id]];
  }
});
});

setInterval(function() {
for (var rm in rooms) {
  if(rooms[rm].players.numPlayers > 0){
    //  console.log("interval player")
      moveProjectiles(rm);
      moveEnemies(rm);
      handleBulletCollisions(rm);

      recoverPlayerHealth(rm);
      checkQuest(rm);
      if (rooms[rm].teamQuests[0].clear) {
        generateEnemies(rm);
        if(!rooms[rm.boss]) releaseTheBeast(rm);
        // if(rooms[rm.boss])  moveTheBeast(rm);

      }
      handleSpecialObjects(rm);
      //console.log("LOGGING rm", rm);
      io.sockets.to(rm).emit('state', rooms[rm].players,
        rooms[rm].projectiles, rooms[rm].enemies, rooms[rm].zones,
        rooms[rm].teamQuests, rooms[rm].boss, rooms[rm].specialObjects);
    }
}
}, 1000 / 30);



//=============================================================================
//Functions

//Creates a new player
function createPlayer(id, serverName, username) {
io.sockets.to(serverName).emit('create map', rooms[serverName].mapData);
rooms[serverName].players.numPlayers += 1;
rooms[serverName].players[id] = {
  playerID: rooms[serverName].players.numPlayers,
  username: username,
  x: 284 * GRID_SIZE,
  y: 147 * GRID_SIZE,
  maxHealth: 40,
  health: 40,
  healthRecoverRate: 1,
  level: 1,
  damage: 5,
  speed: 3*50,
  score: 1000,
  gun: "pistol",
  clip: 12,
  clipSize: 12,
  zone: 0,
  playerSocketId: id,
  questData: {
    bulletsTotal: 0,
    killTotal: 0,
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
    display: true,
    checkCondition: function(player){
      return (player.questData.bulletsTotal >= 30);
    },
    clear: false,
    progress: function(player){
      return "("+player.questData.bulletsTotal+"/"+30+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 100;
    },
    trigger: ["Noisy neighbor"]
  },
  {
    name: "Newbie survivor",
    isMainQuest: false,
    isHidden: false,
    condition: "Survive for 30 seconds",
    description: "Hey, you're stil alive!",
    display: true,
    checkCondition: function(player){
      var currentTime = new Date();
      return (currentTime - player.questData.startTime > 30*1000);
    },
    clear: false,
    progress: function(player){
      var currentTime = new Date();
      return "("+Math.round((currentTime-player.questData.startTime)/1000)+"/"+30+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 100;
    },
    trigger: ["What am I doing here?"]
  },
  {
    name: "What am I doing here?",
    isMainQuest: false,
    isHidden: false,
    condition: "Survive for 90 seconds",
    description: "Hey, you're stil alive!",
    display: false,
    checkCondition: function(player){
      var currentTime = new Date();
      return (currentTime - player.questData.startTime > 90*1000);
    },
    clear: false,
    progress: function(player){
      var currentTime = new Date();
      return "("+Math.round((currentTime-player.questData.startTime)/1000)+"/"+90+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 100;
    },
    trigger: ["Experienced survivor"]
  },
  {
    name: "Experienced survivor",
    isMainQuest: false,
    condition: "Survive for 3 minutes",
    description: "Hey, you're stil alive!",
    display: false,
    checkCondition: function(player){
      var currentTime = new Date();
      return (currentTime - player.questData.startTime > 3*60*1000);
    },
    clear: false,
    progress: function(player){
      var currentTime = new Date();
      return "("+Math.round((currentTime-player.questData.startTime)/60000)+"/"+3+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 300;
    },
    trigger: ["Survived half of the demo"]
  },
  {
    name: "Survived half of the demo",
    isMainQuest: false,
    condition: "Survive for 6 minutes",
    description: "So we didn't die in the middle of the demo! Great!",
    display: false,
    checkCondition: function(player){
      var currentTime = new Date();
      return (currentTime - player.questData.startTime > 6*60*1000);
    },
    clear: false,
    progress: function(player){
      var currentTime = new Date();
      return "("+Math.round((currentTime-player.questData.startTime)/60000)+"/"+6+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 300;
    },
    trigger: []
  },
  {
    name: "Noisy neighbor",
    isMainQuest: false,
    condition: "Shoot 100 times",
    description: "Bang! x100",
    display: false,
    checkCondition: function(player){
      return (player.questData.bulletsTotal >= 100);
    },
    clear: false,
    progress: function(player){
      return "("+player.questData.bulletsTotal+"/"+100+")";
    },
    progressText: "",
    complete: function(player) {
      player.score += 200;
    },
    trigger: []
  }]
};
}

// Calculates each players score
function playerScore(){

}

// Calculates each players health
function playerHealth(){

}

function roomData(serverName) {
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
room.spawnRate = 0;

room.zones = {};

room.specialObjects = {
  rotundaBoss: undefined,
  RCBBoss1: undefined,
  RCBBoss2: undefined,
  ASBBoss: undefined
}

room.questData = {
  RCBSpawn: false,
  quizState: "",
  quizStartTime: -1,
  quizComplete: false
}

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
    trigger: ["Progress to the Escape 1"]
  },
  {
    name: "Progress to the Escape 1", //TODO: change after demo classroom decided!
    isMainQuest: true,
    isHidden: false,
    condition: "Achieve total score 500",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      var totalScore = 0;
      for (var id in rooms[rm].players) {
        var player = rooms[rm].players[id];
        if (!player || !player.score) {
          continue;
        }
        totalScore += player.score;
      }
      this.totalScore = totalScore;
      return (totalScore >= 500);
    },
    clear: false,
    progress: function(rm){
      return "("+this.totalScore+"/"+300+")";
    },
    progressText: "",
    completeDescription: "Open - W.A.C. Library",
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
        if (room.teamQuests[q].name == "Progress to the Escape 1") {
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
        otherPlayer.score += 300;
        //trigger next quests
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
        "Well done! Proceed to the library. Now our goal is 800.");
      //library mall open
      var libraryZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "W.A.C. Library") {
          libraryZoneNum = zoneNum;
          break;
        }
      }
      if (!room.zones[libraryZoneNum].open) {
        room.zones[libraryZoneNum].open = true;
        io.sockets.to(rm).emit("zoneOpen", "quest complete!");
      }
    },
    trigger: ["Progress to the Escape 2"]
  },
  {
    name: "Progress to the Escape 2", //TODO: change after demo classroom decided!
    isMainQuest: true,
    isHidden: false,
    condition: "Achieve total score 800",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      var totalScore = 0;
      for (var id in rooms[rm].players) {
        var player = rooms[rm].players[id];
        if (!player || !player.score) {
          continue;
        }
        totalScore += player.score;
      }
      this.totalScore = totalScore;
      return (totalScore >= 800);
    },
    clear: false,
    progress: function(rm){
      return "("+this.totalScore+"/"+800+")";
    },
    progressText: "",
    completeDescription: "Open - Mysterious Beseiged Citadel",
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
        if (room.teamQuests[q].name == "Progress to the Escape 2") {
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
        otherPlayer.score += 300;
        //trigger next quests
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
        "Well done! Proceed to the MBC. Now our goal is 1000.");
      //library mall open
      var mbcZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "Mysterious Beseiged Citadel") {
          mbcZoneNum = zoneNum;
          break;
        }
      }
      if (!room.zones[mbcZoneNum].open) {
        room.zones[mbcZoneNum].open = true;
        io.sockets.to(rm).emit("zoneOpen", "quest complete!");
      }
    },
    trigger: ["Progress to the Escape 3"]
  },
  {
    name: "Progress to the Escape 3", //TODO: change after demo classroom decided!
    isMainQuest: true,
    isHidden: false,
    condition: "Achieve total score 1500",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      var totalScore = 0;
      for (var id in rooms[rm].players) {
        var player = rooms[rm].players[id];
        if (!player || !player.score) {
          continue;
        }
        totalScore += player.score;
      }
      this.totalScore = totalScore;
      return (totalScore >= 1500);
    },
    clear: false,
    progress: function(rm){
      return "("+this.totalScore+"/"+1000+")";
    },
    progressText: "",
    completeDescription: "Warning! Boss battle starts right away.",
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
        otherPlayer.score += 300;
        //trigger next quests
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
        "Waring! Mysterious enemy appeared inside rotunda..");
      //library mall open
      var rotundaZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "Rotunda") {
          rotundaZoneNum = zoneNum;
          break;
        }
      }

      rooms[rm].specialObjects.rotundaBoss = rotundaBossObj(96*GRID_SIZE, 175*GRID_SIZE);
      if (!room.zones[rotundaZoneNum].open) {
        room.zones[rotundaZoneNum].open = true;
        io.sockets.to(rm).emit("zoneOpen", "quest complete!");
      }

      //spawing rotunda boss!
    },
    trigger: ["Save the Rotunda"]
  },
  {
    name: "Save the Rotunda", //TODO: change after demo classroom decided!
    isMainQuest: true,
    isHidden: false,
    condition: "Kill the enemy in Rotunda",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      return (!rooms[rm].specialObjects.rotundaBoss);
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    completeDescription: "Increased health and clipSize",
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
        if (room.teamQuests[q].name == "Save the Rotunda") {
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
        otherPlayer.score += 200;
        otherPlayer.clipSize = otherPlayer.clipSize * 2;
        otherPlayer.clip = otherPlayer.clipSize;
        otherPlayer.maxHealth = otherPlayer.maxHealth *1.6;
        otherPlayer.health = otherPlayer.maxHealth;
        //trigger next quests
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
        "Great! Now proceed to RCB......");
      //library mall open
      var rcbZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "Rose, Camelia, and Begoina") {
          rcbZoneNum = zoneNum;
          break;
        }
      }

      room.zones[rcbZoneNum].open = true;
      io.sockets.to(rm).emit("zoneOpen", "quest complete!");


      //spawing rotunda boss!
    },
    trigger: ["Find the Wine Room"]
  },
  {
    name: "Find the Wine Room",
    isMainQuest: true,
    isHidden: false,
    condition: "Enter the small room on North East side of RCB",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      var isComplete = true;
      for (var id in rooms[rm].players) {
        var player = rooms[rm].players[id];
        if (!player || !player.x) {
          continue;
        }
        if (!(player.x > 302*GRID_SIZE && player.x < 317*GRID_SIZE
          && player.y > 77*GRID_SIZE && player.y < 85*GRID_SIZE)) {
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
    completeDescription: "RCB battle begins.",
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
        if (room.teamQuests[q].name == "Find the Wine Room") {
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
      otherPlayer.score += 200;
        otherPlayer.clipSize = Math.floor(otherPlayer.clipSize * 2);
        otherPlayer.clip = otherPlayer.clipSize;
        otherPlayer.maxHealth = Math.floor(otherPlayer.maxHealth *1.6);
        otherPlayer.health = otherPlayer.maxHealth;
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
        "Oh, no!");

      rooms[rm].specialObjects.RCBBoss1 = RCBBossObj(272*GRID_SIZE, 122*GRID_SIZE, 1);
      rooms[rm].specialObjects.RCBBoss2 = RCBBossObj(307*GRID_SIZE, 128*GRID_SIZE, 2);

      rooms[rm].questData.RCBSpawn = true;

    },
    trigger: ["Struggle to survive"]
  },
  {
    name: "Struggle to survive",
    isMainQuest: true,
    isHidden: false,
    condition: "Kill the enemies in RCB",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      return (!rooms[rm].specialObjects.RCBBoss1 && !rooms[rm].specialObjects.RCBBoss2);
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    completeDescription: "Increased health and clipSize",
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
        if (room.teamQuests[q].name == "Struggle to survive") {
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
      otherPlayer.score += 200;
        otherPlayer.clipSize = Math.floor(otherPlayer.clipSize * 1.5);
        otherPlayer.clip = otherPlayer.clipSize;
        otherPlayer.maxHealth = Math.floor(otherPlayer.maxHealth *1.3);
        otherPlayer.health = otherPlayer.maxHealth;
        //trigger next quests
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
        "That was close!");
      //library mall open
      var rcbZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "South Western Hallway") {
          rcbZoneNum = zoneNum;
          break;
        }
      }

      room.zones[rcbZoneNum].open = true;
      io.sockets.to(rm).emit("zoneOpen", "quest complete!");


      //spawing rotunda boss!
    },
    trigger: ["Checking around the SWH"]
  },
  {
    name: "Checking around the SWH",
    isMainQuest: true,
    isHidden: false,
    condition: "Kill 30 enemies",
    description: "",
    display: false,
    startTotal: -1,
    currentTotal: 0,
    checkCondition: function(rm){
      total = 0;
      for (var id in rooms[rm].players) {
        if (!rooms[rm].players[id].questData) {
          continue;
        }
        total += rooms[rm].players[id].questData.killTotal;
      }
      if (this.startTotal == -1) {
        this.startTotal = total;
      }
      this.currentTotal = total - this.startTotal;
      return (this.currentTotal >= 10);
    },
    clear: false,
    progress: function(rm){
      return "("+this.currentTotal+"/"+10+")";
    },
    progressText: "",
    completeDescription: "Software Center open",
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
        if (room.teamQuests[q].name == "Checking around the SWH") {
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
      otherPlayer.score += 200;
        otherPlayer.clipSize = Math.floor(otherPlayer.clipSize * 1.5);
        otherPlayer.clip = otherPlayer.clipSize;
        otherPlayer.maxHealth = Math.floor(otherPlayer.maxHealth *1.3);
        otherPlayer.health = otherPlayer.maxHealth;
        //trigger next quests
        //trigger next quests
        for (var i = 0; i < quest.trigger.length; i++) {
          for (var nextQ in otherPlayer.quests) {
            if (otherPlayer.quests[nextQ].name == quest.trigger[i] && !otherPlayer.quests[nextQ].clear) {
              otherPlayer.quests[nextQ].display = true;
            }
          }
        }
      }
      // io.sockets.to(rm).emit("message", "That was close!");
      //library mall open
      var scZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "Software Center") {
          scZoneNum = zoneNum;
          break;
        }
      }

      room.zones[scZoneNum].open = true;
      io.sockets.to(rm).emit("zoneOpen", "quest complete!");


      //spawing rotunda boss!
    },
    trigger: ["Heading to the Software Center"]
  },
  {
    name: "Heading to the Software Center",
    isMainQuest: true,
    isHidden: false,
    condition: "All players enter the Software Center",
    description: "",
    display: false,
    startTotal: -1,
    currentTotal: 0,
    checkCondition: function(rm){
      allInside = true;
      for (var id in rooms[rm].players) {
        if (!rooms[rm].players[id].questData) {
          continue;
        }
        if (rooms[rm].players[id].zone != 6) {
          allInside = false;
        }
      }
      return allInside;
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    completeDescription: "Ready for the Challenge?",
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
        if (room.teamQuests[q].name == "Heading to the Software Center") {
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
      otherPlayer.score += 200;
        //trigger next quests
        //trigger next quests
        for (var i = 0; i < quest.trigger.length; i++) {
          for (var nextQ in otherPlayer.quests) {
            if (otherPlayer.quests[nextQ].name == quest.trigger[i] && !otherPlayer.quests[nextQ].clear) {
              otherPlayer.quests[nextQ].display = true;
            }
          }
        }
      }
      // io.sockets.to(rm).emit("message", "That was close!");
      //Close ALL other zones!
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name != "Software Center") {
          room.zones[zoneNum].open = false;
        }
      }

      runQuiz(rm);
    },
    trigger: ["Quiz? Now?? Seriously????"]
  },

  {
    name: "Quiz? Now?? Seriously????",
    isMainQuest: true,
    isHidden: false,
    condition: "Pass the quiz!",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      runQuiz(rm);
      return rooms[rm].questData.quizComplete;
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    completeDescription: "Open - ASB",
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
        if (room.teamQuests[q].name == "Quiz? Now?? Seriously????") {
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
      otherPlayer.score += 200;
        //trigger next quests
        //trigger next quests
        for (var i = 0; i < quest.trigger.length; i++) {
          for (var nextQ in otherPlayer.quests) {
            if (otherPlayer.quests[nextQ].name == quest.trigger[i] && !otherPlayer.quests[nextQ].clear) {
              otherPlayer.quests[nextQ].display = true;
            }
          }
        }
      }
      // io.sockets.to(rm).emit("message", "That was close!");
      //Close ALL other zones!
      for (var zoneNum in room.zones) {
        room.zones[zoneNum].open = true;
      }


      io.sockets.to(rm).emit("message",
        "Player.......");
      io.sockets.to(rm).emit("message",
        "You finally made it here.");
      io.sockets.to(rm).emit("message",
        "Your last goal is to defeat the enemy in ASB.");
      io.sockets.to(rm).emit("message",
        "Our own home.\nWhere we spend most of the time.\nWhere the random pop machine sits in.");

      //400, 240.
      rooms[rm].specialObjects.ASBBoss = ASBBossObj(400*GRID_SIZE, 240*GRID_SIZE);
    },
    trigger: ["Last Battle"]
  },
  {
    name: "Last Battle",
    isMainQuest: true,
    isHidden: false,
    condition: "Kill the Ultimate Boss",
    description: "",
    display: false,
    currentTotal: 0,
    checkCondition: function(rm){
      return !rooms[rm].specialObjects.ASBBoss;
    },
    clear: false,
    progress: function(rm){
      return "(Incomplete)";
    },
    progressText: "",
    completeDescription: "Game Clear",
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
        if (room.teamQuests[q].name == "Last Battle") {
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
      otherPlayer.score += 200;
        otherPlayer.clipSize = Math.floor(otherPlayer.clipSize * 1.5);
        otherPlayer.clip = otherPlayer.clipSize;
        otherPlayer.maxHealth = Math.floor(otherPlayer.maxHealth *1.3);
        otherPlayer.health = otherPlayer.maxHealth;
        //trigger next quests
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
        "That was close!");
      //library mall open
      var rcbZoneNum = 0;
      for (var zoneNum in room.zones) {
        if (room.zones[zoneNum].name == "South Western Hallway") {
          rcbZoneNum = zoneNum;
          break;
        }
      }


      //Game clear!
      gameClear(rm);
    },
    trigger: []
  }];

return room
}

function gameClear(rm) {
  io.sockets.to(rm).emit("game clear");
}
//Creates a new room
function createRoom(serverName) {

//Dont remake room if it already exists
if (rooms[serverName]) {
  console.log("Skipping duplicate room request");
  return -1;
}

rooms[serverName] = roomData(serverName);
// console.log("LOGGING ROOMS", rooms[serverName]);

//Load map data
var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
var processor = require('./static/objects/mapProcessor.js');
rooms[serverName].mapData = processor.constructFromData(mapDataFromFile);
rooms[serverName].zones = processor.constructZone(mapDataFromFile);
//console.log(mapData);///////*******
// io.sockets.to(serverName).emit('create map', rooms[serverName].mapData);
// console.log('players.numPlayers: ', rooms[serverName].players.numPlayers, ', create map called');
}

//Moves a player in response to keyboard input
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


//check if there is collision  at direction
function hasCollision(x, y, rm) {
var gridX = Math.floor(x / GRID_SIZE);
var gridY = Math.floor(y / GRID_SIZE);
// console.log(rooms[rm].zones)
for (zoneNum in rooms[rm].zones) {
  if (!rooms[rm].zones[zoneNum].open
    && rooms[rm].zones[zoneNum].inside(gridX, gridY)) {
    return true;
  }
}
// console.log("logging x, y", x, y, "logging grids", gridX, gridY);
if(rooms[rm] == undefined || rooms[rm].mapData == undefined
  || rooms[rm].mapData[gridX] == undefined
  || rooms[rm].mapData[gridX][gridY] == undefined) {
  // console.log("collision " + gridX + ", " + gridY)
  // console.log("inside exception");
  return false;
} else if(rooms[rm].mapData[gridX][gridY].collision == true){
  // console.log("collision " + gridX + ", " + gridY)
  // console.log("returning from collision");
  return true;
}


// console.log(rooms[rm].mapData[gridX][gridY].collision, x, y);
// console.log("outside exception");
return false;
}

function handleSpecialObjects(rm) {
// Handles special objects that are hard-coded.
if (rooms[rm].specialObjects.rotundaBoss) {
  // console.log("rotunda boss moving....");
  rooms[rm].specialObjects.rotundaBoss.behave(rm);
}
if (rooms[rm].specialObjects.RCBBoss1) {
  rooms[rm].specialObjects.RCBBoss1.behave(rm);
}
if (rooms[rm].specialObjects.RCBBoss2) {
  rooms[rm].specialObjects.RCBBoss2.behave(rm);
}
if (rooms[rm].specialObjects.ASBBoss) {
  rooms[rm].specialObjects.ASBBoss.behave(rm);
}
}

function rotundaBossObj(spawnX, spawnY) {
return {
  x: spawnX,
  y: spawnY,
  vx: 50,
  vy: 50,
  size: 2,
  speed: 0.8*140,
  health: 50,
  maxHealth: 50,
  behave: function(rm) {
    rotundaBoss = rooms[rm].specialObjects.rotundaBoss;
    if ( rooms[rm].players.numPlayers > 0 ) {
    // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
      var closestPlayer;
      var closestPlayerDistance = Infinity;
      for (var player in rooms[rm].players) {
        var distX = rooms[rm].players[player].x - rotundaBoss.x;
        var distY = rooms[rm].players[player].y - rotundaBoss.y;
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
      distX = rotundaBoss.x - rooms[rm].players[closestPlayer].x;
      distY = rotundaBoss.y - rooms[rm].players[closestPlayer].y;

      var attackTheta = Math.atan(distX / distY);

      var sign = -1;
      if (rotundaBoss.y < rooms[rm].players[closestPlayer].y) {
        sign = 1;
      }

      if ( Math.abs(distX) < 30 && Math.abs(distY) < 30 ) {
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

      rotundaBoss.vx =  rotundaBoss.speed * Math.sin(attackTheta) * sign;
      rotundaBoss.vy =  rotundaBoss.speed * Math.cos(attackTheta) * sign;
      var originX = rotundaBoss.x;
      var originY = rotundaBoss.y;
      rotundaBoss.x += rotundaBoss.vx/updatePerSecond;
      rotundaBoss.y += rotundaBoss.vy/updatePerSecond;
     //  console.log("logging enemy coordinates", rooms[rm].enemies[id].x, rooms[rm].enemies[id].y);
      if(hasCollision(rotundaBoss.x, rotundaBoss.y, rm)){
        rotundaBoss.x = originX;
        rotundaBoss.y = originY;
      }


      //handling bullet collision
      for (var id in rooms[rm].projectiles) {
        if (rooms[rm].projectiles[id]) {
          if ( (Math.abs(rotundaBoss.x - rooms[rm].projectiles[id].x) < 30) &&
              (Math.abs(rotundaBoss.y - rooms[rm].projectiles[id].y) < 30) ) {
                rotundaBoss.health -= 1;
                if (rotundaBoss.health < 0) {
                  // console.log(rooms[rm].players[rooms[rm].projectiles[id].ownerID]);
                  processKillScore(rooms[rm].players[rooms[rm].projectiles[id].ownerID],
                    "player", "(this parameter is not used for enemy)", "boss");
                  delete rooms[rm].specialObjects.rotundaBoss;
                }
          }
        }
      }
  }
}
};
}

function RCBBossObj(spawnX, spawnY, num) {
return {
  x: spawnX,
  y: spawnY,
  num: num,
  vx: 50,
  vy: 50,
  size: 2,
  speed: 0.8*140,
  health: 30,
  maxHealth: 30,
  behave: function(rm) {
    num = this.num;
    rcbBoss = rooms[rm].specialObjects.RCBBoss1;
    if (num == 2) {
      rcbBoss = rooms[rm].specialObjects.RCBBoss2;
    }

    if ( rooms[rm].players.numPlayers > 0 ) {
    // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
      var closestPlayer;
      var closestPlayerDistance = Infinity;
      for (var player in rooms[rm].players) {
        var distX = rooms[rm].players[player].x - rcbBoss.x;
        var distY = rooms[rm].players[player].y - rcbBoss.y;
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
      distX = rcbBoss.x - rooms[rm].players[closestPlayer].x;
      distY = rcbBoss.y - rooms[rm].players[closestPlayer].y;

      var attackTheta = Math.atan(distX / distY);

      var sign = -1;
      if (rcbBoss.y < rooms[rm].players[closestPlayer].y) {
        sign = 1;
      }

      if ( Math.abs(distX) < 30 && Math.abs(distY) < 30 ) {
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

      rcbBoss.vx =  rcbBoss.speed * Math.sin(attackTheta) * sign;
      rcbBoss.vy =  rcbBoss.speed * Math.cos(attackTheta) * sign;
      var originX = rcbBoss.x;
      var originY = rcbBoss.y;
      rcbBoss.x += rcbBoss.vx/updatePerSecond;
      rcbBoss.y += rcbBoss.vy/updatePerSecond;
     //  console.log("logging enemy coordinates", rooms[rm].enemies[id].x, rooms[rm].enemies[id].y);
      if(hasCollision(rcbBoss.x, rcbBoss.y, rm)){
        rcbBoss.x = originX;
        rcbBoss.y = originY;
      }


      //handling bullet collision
      for (var id in rooms[rm].projectiles) {
        if (rooms[rm].projectiles[id]) {
          if ( (Math.abs(rcbBoss.x - rooms[rm].projectiles[id].x) < 30) &&
              (Math.abs(rcbBoss.y - rooms[rm].projectiles[id].y) < 30) ) {
                rcbBoss.health -= 1;
                if (rcbBoss.health < 0) {
                  // console.log(rooms[rm].players[rooms[rm].projectiles[id].ownerID]);
                  processKillScore(rooms[rm].players[rooms[rm].projectiles[id].ownerID],
                    "player", "(this parameter is not used for enemy)", "boss");
                  if (num ==1) {
                    delete rooms[rm].specialObjects.RCBBoss1;
                  }
                  else {
                    delete rooms[rm].specialObjects.RCBBoss2;
                  }

                }
          }
        }
      }
  }
}
};
}

function ASBBossObj(spawnX, spawnY) {
return {
  x: spawnX,
  y: spawnY,
  vx: 50,
  vy: 50,
  size: 2,
  speed: 0.8*140,
  health: 100,
  maxHealth: 100,
  behave: function(rm) {
    asbBoss = rooms[rm].specialObjects.ASBBoss;
    if ( rooms[rm].players.numPlayers > 0 ) {
    // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
      var closestPlayer;
      var closestPlayerDistance = Infinity;
      for (var player in rooms[rm].players) {
        var distX = rooms[rm].players[player].x - asbBoss.x;
        var distY = rooms[rm].players[player].y - asbBoss.y;
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
      distX = asbBoss.x - rooms[rm].players[closestPlayer].x;
      distY = asbBoss.y - rooms[rm].players[closestPlayer].y;

      var attackTheta = Math.atan(distX / distY);

      var sign = -1;
      if (asbBoss.y < rooms[rm].players[closestPlayer].y) {
        sign = 1;
      }

      if ( Math.abs(distX) < 20 && Math.abs(distY) < 20 ) {
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

      asbBoss.vx =  asbBoss.speed * Math.sin(attackTheta) * sign;
      asbBoss.vy =  asbBoss.speed * Math.cos(attackTheta) * sign;
      var originX = asbBoss.x;
      var originY = asbBoss.y;
      asbBoss.x += asbBoss.vx/updatePerSecond;
      asbBoss.y += asbBoss.vy/updatePerSecond;
     //  console.log("logging enemy coordinates", rooms[rm].enemies[id].x, rooms[rm].enemies[id].y);
      if(hasCollision(asbBoss.x, asbBoss.y, rm)){
        asbBoss.x = originX;
        asbBoss.y = originY;
      }


      //handling bullet collision
      for (var id in rooms[rm].projectiles) {
        if (rooms[rm].projectiles[id]) {
          if ( (Math.abs(asbBoss.x - rooms[rm].projectiles[id].x) < 30) &&
              (Math.abs(asbBoss.y - rooms[rm].projectiles[id].y) < 30) ) {
                asbBoss.health -= 1;
                if (asbBoss.health < 0) {
                  // console.log(rooms[rm].players[rooms[rm].projectiles[id].ownerID]);
                  processKillScore(rooms[rm].players[rooms[rm].projectiles[id].ownerID],
                    "player", "(this parameter is not used for enemy)", "boss");
                  delete rooms[rm].specialObjects.ASBBoss;
                }
          }
        }
      }
  }
}
};
}

function runQuiz(rm) {
  var startTime = rooms[rm].questData.quizStartTime;
  if (startTime == -1) {
    rooms[rm].questData.quizStartTime = new Date();
    rooms[rm].questData.quizState = "Welcome!"
    io.sockets.to(rm).emit("quizMessage", "Welcome!", 2);
    return;
  }
  var timeElapsed = new Date() - startTime;
  if (timeElapsed > 0 && timeElapsed < 5000) {
    if (rooms[rm].questData.quizState == "1") {
      return;
    }
    rooms[rm].questData.quizState = "1";
    io.sockets.to(rm).emit("quizMessage", "This is a surprise quiz!", 5);
  }
  else if (timeElapsed < 10000) {
    if (rooms[rm].questData.quizState == "2") {
      return;
    }
    rooms[rm].questData.quizState = "2";
    io.sockets.to(rm).emit("quizMessage", "Move to the correct answer! Are you ready?", 5);
  }
  else if (timeElapsed < 20000) {
    if (rooms[rm].questData.quizState == "q1") {
      return;
    }
    rooms[rm].questData.quizState = "q1";
    choiceList = ["Stan Ford Univ.", "Simon Fraser University",
      "Super Friendly University", "Special Fortification Unit", "Nothing"];
    io.sockets.to(rm).emit("quizMessage", "1. What does S.F.U. stand for?", 10, choiceList);
  }
  else if (timeElapsed < 25000) {
    if (rooms[rm].questData.quizState == "a1") {
      return;
    }
    rooms[rm].questData.quizState = "a1";
    io.sockets.to(rm).emit("quizMessage", "It's Special Fortification Unit!", 5);
  }
  else if (timeElapsed < 35000) {
    if (rooms[rm].questData.quizState == "q2") {
      return;
    }
    choiceList = ['1', '2', '3', '4', '5', '6'];
    rooms[rm].questData.quizState = "q2";
    io.sockets.to(rm).emit("quizMessage", "Second question here.....", 10, choiceList);
  }
  else if (timeElapsed < 40000) {
    if (rooms[rm].questData.quizState == "a2") {
      return;
    }
    rooms[rm].questData.quizState = "a2";
    io.sockets.to(rm).emit("quizMessage", "And answer here!", 5);
  }
  else if (timeElapsed < 50000) {
    if (rooms[rm].questData.quizState == "q3") {
      return;
    }
    choiceList = ['A+', 'A', 'A-', 'B+', 'B', 'F'];
    rooms[rm].questData.quizState = "q3";
    io.sockets.to(rm).emit("quizMessage",
      "3. What does the developers of this game deserve?", 10, choiceList);
  }
  else if (timeElapsed < 55000) {
    if (rooms[rm].questData.quizState == "a3") {
      return;
    }
    rooms[rm].questData.quizState = "a3";
    io.sockets.to(rm).emit("quizMessage", "A+! You know it!", 5);
  }
  else if (timeElapsed < 60000) {
    if (rooms[rm].questData.quizState == "last") {
      return;
    }
    rooms[rm].questData.quizState = "last";
    io.sockets.to(rm).emit("quizMessage", "Congratulations! You passed the quiz.", 5);
  }
  else {
    rooms[rm].questData.quizComplete = true;
  }

}

//Generates a projectile on shoot input
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
  x: rooms[rm].players[id].x + (1 * velX/updatePerSecond),
  y: rooms[rm].players[id].y + (1 * velY/updatePerSecond),
  vx: velX,
  vy: velY,
  ownerID: id,
  ownerName: rooms[rm].players[id].playerID
};
rooms[rm].bulletCount++;

//reset bullet count if too high
if (rooms[rm].bulletCount > 100) {
  spawnEnemiesbulletCount = 0;
}
}

//Spawn a random enemy
function spawnEnemies(rm) {

//Collects map zones that are occupied
zonez = getZones(rm);

//Gets the spawn locations of the occupied zones
spawnZones = getspawnZones(zonez, rm);
console.log(spawnZones);

for (id in spawnZones) {
  spawn = spawnZones[id]
  // spawnX = Math.random() * 50 + spawn.x
  // spawnY = Math.random() * 50 + spawn.y
  spawnX = Math.random() * 150 + spawn[0];
  spawnY = Math.random() * 150 + spawn[1];

  //Enemy spawning can be modelled with X ~ Bernoulli(pi)
  //with pi = p(spawn inside wall). This function respawns enemies repeatedly
  //until they are not inside a wall. Expected #spawns = 1/(1-pi), pi ~= .05
  while(hasCollision(spawnX, spawnY, rm)) {
    spawnX = Math.random() * 150 + spawn[0];
    spawnY = Math.random() * 150 + spawn[1];
  }

  // add the new object to the objects[] array
  if (rooms[rm].enemies.numEnemies < 30) {
    rooms[rm].enemies[rooms[rm].enemyID] = {
      x: spawnX,
      y: spawnY,
      vx: 50,
      vy: 50,
      speed: .8*140,
      health: 10,
      maxHealth: 10
    }
    rooms[rm].enemies.numEnemies++;
    rooms[rm].enemyID++;
  }
  // console.log(rooms[rm].enemies)
}
}

//Returns a list of zones that are currently occupied by a player
function getZones(rm) {
occupiedZones = [];
for (var id in rooms[rm].players) {
  var player = rooms[rm].players[id];

  //Add zones to occupiedZones
  if(player.zone) {
    //Treat occupiedZones as a set, do not add idential elements
    if (occupiedZones.find( function(item) {
    return (player.zone == item) })) continue;
    else occupiedZones.push(player.zone);
    }
}
return occupiedZones;
}

//Returns the coordinates of spawn locations
function getspawnZones(zones, rm) {

occupiedZones = []

for (id in zonez) {
  zone = zones[id];
  switch(zone){
    case "1":
       occupiedZones.push([1980,1555]);
       break;
    case "2":
       occupiedZones.push([2900,1750]);
       break;
    case "3":
       occupiedZones.push([3500,1400]);
       break;
    case "4": //RCB
       if (rooms[rm].questData.RCBSpawn) {
         occupiedZones.push([2675,1260]);
       }
       break;
    case "5":
       occupiedZones.push([4005,2400]);
       break;
    case "6": //Science Center
      if (rooms[rm].questData.quizComplete) {
        occupiedZones.push([3130,2320]);
      }
       break;
    case "7":
       occupiedZones.push([1955,2045]);
       break;
    case "8":
       occupiedZones.push([1765,1740]);
       break;
    case "9":
       occupiedZones.push([1075,1655]);
  }
}
return occupiedZones;

}

//Generate enemies
function generateEnemies(rm) {

// spawn a new object
if (rooms[rm].spawnRate > 900) {
  rooms[rm].spawnRate = rooms[rm].spawnRate -= 1;
}

// get the elapsed time
var time = Date.now();

// see if its time to spawn a new object
if (time > (rooms[rm].lastSpawn + rooms[rm].spawnRate)) {
  rooms[rm].lastSpawn = time;
  spawnEnemies(rm);
  //console.log('emeny spawned. spawnRate: ', spawnRate);
}
}

//Generates bosses
function releaseTheBeast(rm) {
rooms[rm].boss = {
  x: 2950,
  y: 1750,
  vx: 50,
  vy: 50,
  speed: .8*175,
  health: 300,
  maxHealth: 300
}
}

//recover player Health
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

//Move projectiles
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

//Delete a stale bullet
function deleteBullet(id, rm) {
var temp = rooms[rm].projectiles[rooms[rm].bulletCount -= 1];
rooms[rm].projectiles[rooms[rm].bulletCount] = rooms[rm].projectiles[id];
rooms[rm].projectiles[id] = temp;
rooms[rm].projectiles[rooms[rm].bulletCount] = 0;
rooms[rm].projectiles.numProjectiles -= 1;
}

//Move enemies towards the nearest player
function moveEnemies(rm) {
//Enemy movement handler
for (var id in rooms[rm].enemies) {
 //Find closest players
 if ( rooms[rm].players.numPlayers > 0 ) {
 // if ( (players.numPlayers > 0) && (enemies.numEnemies > 0) ) {
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
  //  console.log("logging enemy coordinates", rooms[rm].enemies[id].x, rooms[rm].enemies[id].y);
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

//Handles bullet collisions
function handleBulletCollisions(rm) {
//Player-projectile collision handler
for (var player in rooms[rm].players) {
  for (var id in rooms[rm].projectiles) {
    if (rooms[rm].projectiles[id]) {
      if ( (Math.abs(rooms[rm].players[player].x - rooms[rm].projectiles[id].x) < 2) &&
          (Math.abs(rooms[rm].players[player].y - rooms[rm].projectiles[id].y) < 2) ) {
        rooms[rm].players[player].health -= 1;
        if (rooms[rm].players[player].health < 0) {
          processKillScore(rooms[rm].players[rooms[rm].projectiles[id].ownerID],
            "player", player, "player");
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
      if ( (Math.abs(rooms[rm].enemies[enemy].x - rooms[rm].projectiles[id].x) < 12) &&
          (Math.abs(rooms[rm].enemies[enemy].y - rooms[rm].projectiles[id].y) < 12) ) {
            rooms[rm].enemies[enemy].health -= 1;
            if (rooms[rm].enemies[enemy].health < 0) {
              processKillScore(rooms[rm].players[rooms[rm].projectiles[id].ownerID],
                "player", "(this parameter is not used for enemy)", "enemy");
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

function processKillScore(killer, killerType, dead, deadType) {
//possible types: "player", "enemy", "boss"
//player kill enemy: processKillScore(playerObject, "player", playerObject, "player");
if (!killer) {
  return;
}
if (killerType == "player") {
  if (deadType == "player") {
    //Team kill!!
    killer.score -= 9999999;  //don't kill teammate lol
    killer.questData.killTotal += 1;
    console.log(killer.questData.killTotal);
  }
  else if (deadType == "enemy") {
    killer.score += 35;
    killer.questData.killTotal += 1;
    console.log(killer.questData.killTotal);
  }
  else if (deadType == "boss") {
    killer.score += 200;
    killer.questData.killTotal += 1;
    console.log(killer.questData.killTotal);
  }
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

//Reload players gun
function reloadGun(player) {
player.clip = player.clipSize;
}

//Kill a player below 0 health
function youveBeenTerminated(player, rm) {
rooms[rm].players[player] = 0;
console.log(rooms[rm].players[player]);
rooms[rm].numPlayers -= 1;

if (rooms[rm].numPlayers <= 0) {
  console.log("room deleted: number of players ", rooms[rm].numPlayers);
  delete rooms[rm];
}
//Load "YOUVE FAILED SCREEN"
}

//Loads the you've failed screen
function youFailed(player, rm) {

}

//Runs A* to generate the optimal route to get to the player
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
    if(successors[successor] == 0) continue;
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

//Move Left
stateL = [[state[0] - (2 * GRID_SIZE), state[1]], "left", 1];
stateLCoords = stateL[0];
if(hasCollision(stateLCoords[0], stateLCoords[1], rm)) stateL = 0;

//Move Right
stateR = [[state[0] + (2 * GRID_SIZE), state[1]], "right", 1];
stateRCoords = stateR[0];
if(hasCollision(stateRCoords[0], stateRCoords[1], rm)) stateR = 0

//Move Up
stateU = [[state[0], state[1] - (2 * GRID_SIZE)], "up", 1];
stateUCoords = stateU[0];
if(hasCollision(stateUCoords[0], stateUCoords[1], rm)) stateU = 0

//Move Down
stateD = [[state[0], state[1] + (2 * GRID_SIZE)], "down", 1];
stateDCoords = stateD[0];
if(hasCollision(stateDCoords[0], stateDCoords[1], rm)) stateD = 0

var states = [stateL, stateR, stateU, stateD];
return states;
}

//Return true if goal state at state
function isGoalState(state, goal) {
goalx = Math.floor(goal[0] / (1 * GRID_SIZE));
goaly = Math.floor(goal[1] / (1 * GRID_SIZE));
statex = Math.floor(state[0] / (1 * GRID_SIZE));
statey = Math.floor(state[1] / (1 * GRID_SIZE));

if ((goalx == statex) && (goaly == statey)) return true;
else return false;
}

//Return the manhattan distance between position and goal
function manhattanHeuristic(position, goal) {
var xy1 = [(position[0] / (1 * GRID_SIZE)), (position[1] / (1 * GRID_SIZE))];
var xy2 = [(goal[0] / (1 * GRID_SIZE)), (goal[1] / (1 * GRID_SIZE))];
return Math.abs(xy1[0] - xy2[0]) + Math.abs(xy1[1] - xy2[1]);
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

//=========================================================================================
// Testing functions

function returnRooms(){
return rooms;
}

function returnProjectiles(serverName) {
return rooms[serverName].projectiles
}
//=========================================================================================


//=============================================================================
// Fazal Workspace
// Settings page
// app.get('/', function(request, response)
// {
//    var message ={'message':''};
//    response.render('settings/options.html',message);
// });

// // Enemy moves towards player while avoiding an obstacle
// // Calculate vector between player and target


// // // Enemy moves towards player while avoiding an obstacle
// // // Calculate vector between player and target
// var toPlayerX = playerPosX - enemyPosX;
// var toPlayerY = playerPosY - enemyPosY;

// // // Calculate vector between mouse and target
// var toMouseX = mousePosX - enemyPosX;
// var toMouseY = mousePosY - enemyPosY;

// // // Calculate distance between player and enemy, mouse and enemy
// var toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
// var toMouseLength = Math.sqrt(toMouseX * toMouseX + toMouseY * toMouseY);

// // // Normalize vector player
// toPlayerX = toPlayerX / toPlayerLength;
// toPlayerY = toPlayerY / toPlayerLength;

// // // Normalize vector mouse
// toMouseX = toMouseX / toMouseLength;
// toMouseY = toMouseY / toMouseLength;

// // // Move enemy torwards player
// enemyPosX += toPlayerX * speed;
// enemyPosY += toPlayerY * speed;

// // // Move enemy away from obstacle (a bit slower than towards player)
// enemyPosX -= toMouseX * (speed * 0.4);
// enemyPosY -= toMouseY * (speed * 0.4);


//Function to return a vector from one point to the next
// Code is in ES6(a js framework)
// fx, fy is from coordinate
// tx, ty is to coordinate
// function getNormVec(fx, fy, tx, ty){
//   var x = tx - fx;  // get differance
//   var y = ty - fy;
//   var dist = Math.sqrt(x * x + y * y); // get the distance.
//   x /= dist;  // normalised difference
//   y /= dist;
//   return {x,y};
// }

// var myObj = {}
// var myTarget = {};
// var myBullet = {}
// myObj.x = 100;
// myObj.y = 100;
// myTarget.x = 1000
// myTarget.y = 1000

// var vecToTag = getNormVect(myObj.x, myObj.y, myTarget.x, myTarget.y);
// myBullet.nx = vecToTag.x; // set bullets direction vector
// myBullet.ny = vecToTag.y;
// myBullet.x = myObj.x; // set the bullet start position.
// myBullet.y = myObj.y;
// myBullet.speed = 5; // set speed 5 pixels per frame

// myBullet.x += myBullet.nx * myBullet.speed;
// myBullet.y += myBullet.ny * myBullet.speed;



  // for (i = 0; i < 100; i ++) {
  //   players[socket.id].x -= .2;
  //   players[socket.id].y -= .2;
  // }


  // projectiles.numProjectiles = bulletCount;
  // bulletCount += 1;
  // projectiles[bulletCount] = {
  //   x: 300,
  //   y: 300,
  //   projectileSpeed: 1
  // };
  // shot = projectiles[bulletCount];
  // while (shot.x < 1000 && shot.y < 1000) {
  //   shot.x += shot.projectileSpeed;
  //   shot.y += shot.projectileSpeed;
  //     // console.log("[" + data.x + ", " + data.y + "]");
  //   if (shot.x == 1000 || shot.y == 1000) {
  //     projectiles[bulletCount] = 0;
  //   }
  // }




// var player = players[socket.id] || {};

//   // Handles player damage - at health <= 0, player is removed
//   if (data.shoot) {
//     player.health -= .2;
//     if (player.health <= 0) {
//       players[socket.id] = 0;
//       players.numPlayers -= 1;
//     }
//   }

// var stageWidth = 1000;
// var stageHeight = 1000;

// var enemies = [];

// var enemyWidth = 50;
// var enemyHeight = 100;

// function spawnEnemy(){

//     //console.log('Spawn a new enemy!');

//     // Generate a random x position.
//     var randomXPosition = Math.floor(Math.random() * (stageWidth - enemyWidth)) + 1;

//     // Generate a random y position.
//     var randomYPosition = Math.floor(Math.random() * (stageHeight - enemyHeight)) + 1;

//     //Create a new Enemy instance and use above coordinates to place it in a random spot.
//     //Fill the rest of this object like we did with var bullet = {...}.
//     var newEnemy = {
//         xPosition: randomXPosition,
//         yPosition: randomYPosition,
//     };

//     // Push new enemy in the enemies array so we can render them all at once in the draw loop.
//     enemies.push(newEnemy);
// }



// //This function will run 'spawnEnemy()' every 'intervalInMilliSeconds'.
// setInterval(spawnEnemy);

// setInterval(function(){
//   io.sockets.emit('enemyState', enemies);
// }, 1000 / 120);

//=============================================================================

//=============================================================================
// Hailey Workpace

//=============================================================================




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
//fetch account info
const fetchQ = `SELECT * FROM account WHERE username ='${uname}';`;
pool.query(fetchQ, (error,results)=>{
  if (error)
  {
    console.log('Authorizing failed - Fetching account info failed');
    throw(error);
  };
  // console.log(results);
  var account = results.rows[0];
  if (account)
  {
    console.log('Account info\n'+account);
    const authorQ =
  `SELECT (password=crypt('${pw}','${account.password}')) AS password FROM account WHERE username ='${uname}';`;
//Compare hashed pw with input pw
    pool.query(authorQ,(error,authen)=>
    {
      if (error)
      {
        console.log('Authorization failed - Failed to compare hased password');
        throw(error);
      };
      //varification succeeded
      if (authen.rows[0]){
        console.log('Hased pw == pw');
        if (account.online) {
          console.log("Redundant login attempt for user $1", [uname]);
          var message ={'message':'Account is already logged in!'};
          response.render('pages/login',message);
        };

        if (uname == "ADMIN301254694") {
            //Extract all table information
            pool.query("SELECT * FROM account;", (error,results) => {
              if (error) {
                throw(error);
              }
              var results = {'rows': results.rows };
              response.render('pages/admin', results);
            });
          }
        else {
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
           console.log(`logging in ${uname}`);
           response.render('pages/matchmaking', user);
         };

      }
      else {
        console.log('Hased pw != pw');
        var message ={'message':'Account is not existing'};
        response.render('pages/login', message);
      };
    });
  }
  else {
    var message ={'message':'Account is not existing'};
    response.render('pages/login', message);
  }
});
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
      response.render('pages/login', message);
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
pool.query(query,[uname],(error, results)=> {
  if (error)
    throw (error);
  if (results.rows[0].online)
  {
    console.log("Redundant login attempt for user $1", [uname]);
    var message ={'message':'Account is already logged in!'};
   response.render('pages/login',message);
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
    //  response.render('pages/index',user);
     response.render('pages/matchmaking', user);
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
               encryptPW(uname);
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

// ENcrpting password when resgister
function encryptPW(uname) {
const query = `SELECT password FROM account WHERE username ='${uname}';`
pool.query(query, (error, results)=>{
  if (error)
  {
    console.log('Encryption failed - failed to get password');
    throw (error);
  }
  var pw = results.rows[0];
  //Encrypting
  const encryptQ =
`UPDATE account SET password = crypt('${pw}',gen_salt('md5')) WHERE username ='${uname}'`;

  pool.query(encryptQ,(error, results)=>{
    if (error)
    {
      console.log('Encryption failed - failed to encrypted');
      throw(error);
    }
    console.log('Encryption Completed');
  });
});
};


//=============================================================================

//=============================================================================
// George Workpace
app.post('/logout', (request, response)=>{
logOutPlayer(request.body.username);
console.log(`Succesfully logged out ${request.body.username}`);
response.render('pages/login', {'message':'Please play again!'} );
});

app.post('/gameroom', (request, response)=>{
var data = {"server": request.body.serverName, "user": request.body.uname};
console.log("logging results", data)
response.render('pages/index', data);
});

const top = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
constructor(comparator = (a, b) => a[1] < b[1]) {
  this._heap = [];
  this._comparator = comparator;
}
size() {
  return this._heap.length;
}
isEmpty() {
  return this.size() == 0;
}
peek() {
  return this._heap[top];
}
push(...values) {
  values.forEach(value => {
    this._heap.push(value);
    this._siftUp();
  });
  return this.size();
}
pop() {
  const poppedValue = this.peek();
  const bottom = this.size() - 1;
  if (bottom > top) {
    this._swap(top, bottom);
  }
  this._heap.pop();
  this._siftDown();
  return poppedValue;
}
replace(value) {
  const replacedValue = this.peek();
  this._heap[top] = value;
  this._siftDown();
  return replacedValue;
}
_greater(i, j) {
  return this._comparator(this._heap[i], this._heap[j]);
}
_swap(i, j) {
  [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
}
_siftUp() {
  let node = this.size() - 1;
  while (node > top && this._greater(node, parent(node))) {
    this._swap(node, parent(node));
    node = parent(node);
  }
}
_siftDown() {
  let node = top;
  while (
    (left(node) < this.size() && this._greater(left(node), node)) ||
    (right(node) < this.size() && this._greater(right(node), node))
  ) {
    let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
    this._swap(node, maxChild);
    node = maxChild;
  }
}
}


//=============================================================================



//=============================================================================
// Josh Workpace

//=============================================================================
