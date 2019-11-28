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
// app.get('/', function(request, response) {
// response.sendFile(path.join(__dirname, 'index.html'));
//    var user = {'username':'uname'};
//   response.render('pages/matchmaking', user);
// });// Starts the server.
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

      //astar testing here
      // console.log(aStarSearch([100,100], [200,200]));
      if (!rooms[rm]) {
        testAstar(rm);
      }


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
        generateEnemies(rm);
        recoverPlayerHealth(rm);
        checkQuest(rm);
        //console.log("LOGGING rm", rm);
        io.sockets.to(rm).emit('state', rooms[rm].players,
          rooms[rm].projectiles, rooms[rm].enemies, rooms[rm].zones);
      }
  }
}, 1000 / updatePerSecond);



//=============================================================================
//Functions

//Creates a new player
function createPlayer(id, serverName, username) {
  io.sockets.to(serverName).emit('create map', rooms[serverName].mapData);
  rooms[serverName].players.numPlayers += 1;
  rooms[serverName].players[id] = {
    playerID: rooms[serverName].players.numPlayers,
    username: username,
    x: 211 * GRID_SIZE,
    y: 147 * GRID_SIZE,
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
    },
    quests: [
      {
        name: "Combat Ready",
        condition: "Shoot 30 times",
        description: "Ready for the fight?",
        display: true,
        checkCondition: function(player){
          return (player.questData.bulletsTotal == 30);
        },
        clear: false
      },
      {
        name: "Newbie survivor",
        condition: "Survive for 60 seconds",
        description: "Hey, you're stil alive!",
        display: true,
        checkCondition: function(player){
          var currentTime = new Date();
          return (currentTime - player.questData.startTime > 60*1000);
        },
        clear: false
      }

    ]
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
  room.spawnRate = 2000;

  room.zones = {};

  return room
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
  for (zoneNum in rooms[rm].zones) {
    if (!rooms[rm].zones[zoneNum].open
      && rooms[rm].zones[zoneNum].inside(gridX, gridY)) {
      console.log("collision by zone"); /////*******
      return true;
    }
  }
  if(rooms[rm] == undefined || rooms[rm].mapData == undefined
    || rooms[rm].mapData[gridX] == undefined
    || rooms[rm].mapData[gridX][gridY] == undefined) {
    // console.log("collision " + gridX + ", " + gridY)
    // console.log("RETURNING FALSE, ROOM MAPDATA PROBLEM");
    return false;
  } else if(rooms[rm].mapData[gridX][gridY].collision == true){
    // console.log("collision " + gridX + ", " + gridY)
    return true;
  }
  return false;
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

//Spawn a random enemy
function spawnRandomObject(rm) {

  // About Math.random()
  // Math.random() generates a semi-random number
  // between 0-1. So to randomly decide if the next object
  // will be A or B, we say if the random# is 0-.49 we
  // create A and if the random# is .50-1.00 we create B

  // add the new object to the objects[] array
  if (rooms[rm].enemies.numEnemies < 1) {
    rooms[rm].enemies[rooms[rm].enemyID] = {
      // type: t,
      // set x randomly but at least 15px off the canvas edges
      x: Math.random() * 350 + 1600,
      // set y to start on the line where objects are spawned
      y: Math.random() * 300 + 2000,
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

//Generate enemies
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
//checking quest conditions! This part will be very hard to refactor, don't try....
  for (var id in rooms[rm].players) {
    var player = rooms[rm].players[id];

    if (player == undefined || player.questData == undefined) {
      continue;
    }
    // for (var i = 0; i < player) {
    //
    // }
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

function aStarSearch(startState, goal) {
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
    successors = getSuccessors(current[0]);
    for (successor in successors) {
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
function getSuccessors(state) {
  //Use 5 as arbitraty number
  stateL = [[state[0] - (4 * GRID_SIZE), state[1]], "left", 1];
  stateR = [[state[0] + (4 * GRID_SIZE), state[1]], "right", 1];
  stateU = [[state[0], state[1] - (4 * GRID_SIZE)], "up", 1];
  stateD = [[state[0], state[1] + (4 * GRID_SIZE)], "down", 1];
  var states = [stateL, stateR, stateU, stateD];
  return states;
}

//Return true if goal state at state
function isGoalState(state, goal) {
  goalx = Math.floor(goal[0] / (4 * GRID_SIZE));
  goaly = Math.floor(goal[1] / (4 * GRID_SIZE));
  statex = Math.floor(state[0] / (4 * GRID_SIZE));
  statey = Math.floor(state[1] / (4 * GRID_SIZE));

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
  var xy1 = [(position[0] / (4 * GRID_SIZE)), (position[1] / (4 * GRID_SIZE))];
  var xy2 = [(goal[0] / (4 * GRID_SIZE)), (goal[1] / (4 * GRID_SIZE))];
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
    var path = aStarSearch( [enemy.x, enemy.y], [player.x, player.y] );
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
