
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
pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


// var rooms[room];
// var room[socket.id];

app.use('/static', express.static(__dirname + '/static'));// Ring
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
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
var rooms = {};
var globalPlayers = {
  players : [],
};
var getRoomBySocketId = {};
var mapImageSrc = "";
const GRID_SIZE = 10;

setInterval(function() {
  for (var rm in rooms) {
    if(rooms[rm].players.numPlayers > 0){
      //  console.log("interval player")
        moveProjectiles(rm);
        moveEnemies(rm);
        handleBulletCollisions(rm);
        generateEnemies(rm);
        //console.log("LOGGING rm", rm);
        io.sockets.to(rm).emit('state', rooms[rm].players,
          rooms[rm].projectiles, rooms[rm].enemies);
      }
  }
}, 1000 / 120);

io.on('connection', function(socket){/// needs function to remove globalPlayers/rooms elements when player disconnect
  var gameState = "menu"
  initConnection(socket);
  generalProcessor(socket, gameState);
});

function generalProcessor(socket, gameState){
  var data = {
    totalPlayers,
    globalPlayers,
    rooms,
    getRoomBySocketId
  }
  if(gameState == "menu"){
    console.log("gameState = " + gameState);
    mainMenuProcessor(socket, data);
  }else if(gameState == "game"){
    console.log("gameState = " + gameState);
    inGameProcessor(socket, data);
  }
  socket.on('disconnect', function() {
    processDisconnect(socket);
  });
}

function initConnection(socket){
  console.log("connection : " + socket.id)
  totalPlayers++;
  console.log("totalPlayers : " + totalPlayers)
  if(totalPlayers > 0){
    globalPlayers.players.push(socket.id);
  }
  console.log(globalPlayers)
}

function mainMenuProcessor(socket, data){
  // var data = "placeholder"////temporary
  /// roomdata = current client room
  var globalData = {
    totalPlayers,
    globalPlayers
  }
  socket.emit('main menu');
  // socket.broadcast.emit('global', globalData);// emit without the sender
  io.sockets.emit('global', globalData);//emit to all clients
  // socket.emit('room', rooms);
  socket.on('create room', function(roomName){
    processCreateRoom(socket, roomName)
    io.to(roomName).emit('room data', rooms[roomName]);
  });

  socket.on('ready', function(){
    processPlayerReady(socket);
  });

}
//processCreateRoom(roomName);

function inGameProcessor(socket, data){
  initGameStart(socket);
  // socket.on('in game');
  socket.emit("grid size", GRID_SIZE);
  socket.emit("passId", socket.id);
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
      // console.log("emit sound");
      // var sound = "bang";
      // socket.emit('sound', sound);
      generateProjectile(socket.id, data, rm);
    }
  });

}

function processDisconnect(socket){
  console.log('socket event disconnect called');
  if (getRoomBySocketId == undefined
    || getRoomBySocketId[socket.id] == undefined
    || rooms[getRoomBySocketId[socket.id]] == undefined
    || rooms[getRoomBySocketId[socket.id]].players[socket.id] == undefined) {
    //if the socket id is not valid, ignore the disconnect signal
    console.log('invalid disconnect call: ignoring...')
    return;
  }
  delete rooms[getRoomBySocketId[socket.id]].players[socket.id];
  rooms[getRoomBySocketId[socket.id]].players.numPlayers -= 1;
}

function processCreateRoom(socket, roomName){
  socket.join(roomName);
  getRoomBySocketId[socket.id] = roomName;
  if(rooms[roomName] == undefined){
    rooms[roomName] = giveEmptyRoomData(roomName);
  }
  rooms[roomName].players[socket.id] = {};
  rooms[roomName].players.numPlayers++;

  console.log("rooms[roomName]: " + rooms[roomName])
  console.log("LOGGING ROOMS", rooms[roomName]);
}

function joinRoom(){

}

function initGameStart(socket){
  socket.emit('in game');
  var roomName = getRoomBySocketId[socket.id];
  console.log("InitGameStart from player: " + socket.id + "\n\tat room: " + roomName);
  console.log("\trooms[roomName]: " + rooms[roomName])
  initLevel(socket, roomName);
  createInGamePlayer(socket.id, roomName, socket.id);
  console.log("in game data: " + rooms[roomName]);
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

  return room
}

function processPlayerReady(socket){
  var roomName = getRoomBySocketId[socket.id];
  // var ready = rooms[roomName].players[socket.id].ready;
  if(rooms[roomName].players[socket.id].ready == undefined){
    rooms[roomName].players[socket.id].ready = true;
  }else if(rooms[roomName].players[socket.id].ready == true){
    rooms[roomName].players[socket.id].ready = false;
  }else{
    rooms[roomName].players[socket.id].ready = true;
  }
  console.log(socket.id + " ready: " + rooms[roomName].players[socket.id].ready)
  processStartGame(socket);
}

function processStartGame(socket){
  if(isGameStartable(socket)){
    generalProcessor(socket, "game");
  }
}

function isGameStartable(socket){
  // var roomName = getRoomBySocketId[socket.id];
  // var playerList = rooms[roomName].players;
  // for(var player in playerList){
  //   if(player.ready == false){
  //     return false;
  //   }else if(player.ready != true){
  //     console.log("Error in ready: " + player.ready)
  //     return false;
  //   }
  // }
  return true;
}

function initLevel(socket, roomName){
  var mapDataFromFile = JSON.parse(fs.readFileSync('static/objects/testMap2.json', 'utf8'));
  var processor = require('./static/objects/mapProcessor.js');
  console.log("----Inside Init level-----")
  console.log("roomName = " + roomName)
  console.log("rooms[roomName]: " + rooms[roomName])
  console.log("\trooms[roomName].mapData: " + rooms[roomName].mapData)
  rooms[roomName].mapData = processor.constructFromData(mapDataFromFile);
  //console.log(mapData);///////*******
  socket.emit('create map', rooms[roomName].mapData);
  console.log('players.numPlayers: ', rooms[roomName].players.numPlayers, ', create map called');
}

function createInGamePlayer(id, roomName, uName) {
  rooms[roomName].players[id] = {
    userName: uName,
    x: 160 * GRID_SIZE,
    y: 59 * GRID_SIZE,
    healsth: 4.33,
    level: 1,
    damage: 5,
    speed: 3
  };
}


function moveProjectiles(rm) {
  for (var id in rooms[rm].projectiles) {
    if (rooms[rm].projectiles[id]) {
      var delBullet = false;
      var originX = rooms[rm].projectiles[id].x;
      var originY = rooms[rm].projectiles[id].y;
      rooms[rm].projectiles[id].x += rooms[rm].projectiles[id].vx;
      rooms[rm].projectiles[id].y += rooms[rm].projectiles[id].vy;
      if(hasCollision(rooms[rm].projectiles[id].x, rooms[rm].projectiles[id].y, rm)){
        rooms[rm].projectiles[id].x = originX;
        rooms[rm].projectiles[id].y = originY;
        delBullet = true;
        // deleteBullet(id);
      }
      //Delete stale projectiles
      if ( (rooms[rm].projectiles[id].x > 5000) || (rooms[rm].projectiles[id].y > 5000) ||
          (rooms[rm].projectiles[id].x < -5000) || (rooms[rm].projectiles[id].y < -5000)) {
          delBullet = true;
      }
      if(delBullet == true){
        deleteBullet(id, rm);
      }
    }
  }
}

function hasCollision(x, y, rm){
  var gridX = Math.floor(x / GRID_SIZE);
  var gridY = Math.floor(y / GRID_SIZE);
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
       console.log("players[closestPlayer] is undefined. Ignoring",
         "moveEnemies() logic instead of letting program crash.",
         "Please check the logic.");
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

     if ( Math.abs(distX) < 12 && Math.abs(distY) < 12 ) {
       // console.log("distX ", distX, "distY, ", distY);
       //Deplete health
       rooms[rm].players[closestPlayer].health -= .05;
       //Kill player
       // if (players[closestPlayer].health < 0) {
       //   players[closestPlayer] = 0;
       //   players.numPlayers -= 1;
       // }

       //Dont move any closer
       sign = 0;
     }

     rooms[rm].enemies[id].vx =  rooms[rm].enemies[id].speed * Math.sin(attackTheta) * sign;
     rooms[rm].enemies[id].vy =  rooms[rm].enemies[id].speed * Math.cos(attackTheta) * sign;
     var originX = rooms[rm].enemies[id].x;
     var originY = rooms[rm].enemies[id].y;
     rooms[rm].enemies[id].x += rooms[rm].enemies[id].vx;
     rooms[rm].enemies[id].y += rooms[rm].enemies[id].vy;
     if(hasCollision(rooms[rm].enemies[id].x, rooms[rm].enemies[id].y, rm)){
       rooms[rm].enemies[id].x = originX;
       rooms[rm].enemies[id].y = originY;
     }
   }
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
          // if (players[player].health < 0) {
          //   players[player] = 0;
          //   players.numPlayers -= 1;
          // }
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

function spawnRandomObject(rm) {

  // About Math.random()
  // Math.random() generates a semi-random number
  // between 0-1. So to randomly decide if the next object
  // will be A or B, we say if the random# is 0-.49 we
  // create A and if the random# is .50-1.00 we create B

  // add the new object to the objects[] array
  if (rooms[rm].enemies.numEnemies < 10) {
    rooms[rm].enemies[rooms[rm].enemyID] = {
      // type: t,
      // set x randomly but at least 15px off the canvas edges
      x: Math.random() * 350,
      // set y to start on the line where objects are spawned
      y: Math.random() * 300,
      vx: 5,
      vy: 5,
      speed: .5,
      health: 4
    }
    rooms[rm].enemies.numEnemies++;
    rooms[rm].enemyID++;
  }
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
        response.render('pages/matchmaking', user);
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

// var players = -1;
// console.log("  total players: " + players)
// var roomList = {};
// var latestRoom = 0;
// var latestPlayer = 0;
// io.on('connection', function(socket){
  //   players++;
  //   console.log("connection from: " + socket.id)
  //   console.log("  total players: " + players)
  //   socket.emit('global', players);
  //   socket.on('join room', function(){
    //     if(roomList[latestRoom] == undefined){
      //       roomList[latestRoom] = roomData()
      //       ////////////trying to create rooms with many players to see flow of socket
      //     }
      //     roomList[latestRoom].players[latestPlayer] = socket.id;
      //     socket.join(latestRoom)
      //     latestPlayer++;
      //     roomList[latestRoom].players.numPlayers++;
      //     if(roomList[latestRoom].length >= 4){
        //       latestRoom++;
        //     }
        //     console.log(roomList[latestRoom]);
        //     io.sockets.emit('room info', roomList);
        //     console.log(roomList[latestRoom].players.length)
        //     for(var i = 0; i < roomList[latestRoom].players.numPlayers; i++){
          //       var socketID  = roomList[latestRoom].players[i];
          //       console.log("\tsending to: " + socketID);
          //
          //       io.sockets.to(0).emit('player socket', socketID)
          //     }
          //   });
          // });
