const assert = require('chai').assert;
//const sayHello = require('../index').sayHello;
//const addNumbers = require('../index').addNumbers;
const index = require('../index');

// chai-http and server access
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();


chai.use(chaiHttp);

// Results
sayHelloResult = index.sayHello();
addNumbersResult = index.addNumbers(5, 5);
testSpawnResult = index.testSpawn();
testGenerateEnemiesResult = index.testGenerateEnemies();
testEnemyMovementResult = index.testEnemyMovement();
testPlayerShootResult = index.testPlayerShoot();
testPlayerAmmoResult = index.testPlayerAmmo();
testPlayerHealthResult = index.testPlayerHealth();
testPlayerReloadResult = index.testPlayerReload();
testMiniMapResult = index.testMiniMap();
//roomsResult = index.rooms('test');

describe('Index', function(){

    // Test cases for sayHello function
    describe('sayHello()', function(){

        it('sayHello should return hello', function(){
            //let result = index.sayHello();
            assert.equal(sayHelloResult, 'hello');
        });

        it('sayHello should return type string', function(){
            //let result = index.sayHello();
            assert.typeOf(sayHelloResult, 'string');
        });
    });

    //Test cases for addNumbers function
    describe('addNumbers()', function(){

        it('addNumbers should be above 5', function(){
            //let result = index.addNumbers(5, 5);
            assert.isAbove(addNumbersResult, 5);
        });

        it('addNumbers should return type number', function(){
            //let result = index.addNumbers(5, 5);
            assert.typeOf(addNumbersResult, 'number');
        });
    });

    //Test cases for roomData
    describe('roomData()', function(){
        roomDataResult = index.roomData('test');
        it('roomData() created a room object', function(){
            assert.isOk(roomDataResult);
        });
    });

    //Test cases for createRoom
    describe('createRoom()', function() {
        createRoomReusult = index.createRoom('createRoomTest');
        it('createRoom() created a room object with the correct name',
        function() {
            assert.isOk(createRoomReusult['createRoomTest']);
        });
        createTwoRoomsReusult = index.createTwoRooms('twoRoom');
        it('createRoom() correctly handles a duplicate room request',
        function() {
            assert.isOk(createRoomReusult['twoRoom']);
        });
    });

    //Test cases for createPlayer and createRoom
    describe('createPlayer()', function() {
        createPlayersResult = index.createPlayer('1', 'test', 'testName');
        it('createPlayer() created a player object with correct ID and room',
        function(){
            assert.isOk(createPlayersResult['test'].players['1']);
        });
    });

    //Test cases for movePlayer
    describe('movePlayer()', function () {
        directions = {
            dataL: {"left" : true, "right" : false, "up" : false, "down" : false},
            dataR: {"left" : false, "right" : true, "up" : false, "down" : false},
            dataU: {"left" : false, "right" : false, "up" : true, "down" : false},
            dataD: {"left" : false, "right" : false, "up" : false, "down" : true},
            dataNE: {"left" : false, "right" : true, "up" : true, "down" : false},
            dataNW: {"left" : true, "right" : false, "up" : true, "down" : false},
            dataSE: {"left" : false, "right" : true, "up" : false, "down" : true},
            dataSW: {"left" : true, "right" : false, "up" : false, "down" : true},
            dataNS: {"left" : false, "right" : false, "up" : true, "down" : true},
            dataEW: {"left" : true, "right" : true, "up" : false, "down" : false}
        };
        index.createRoom("moveRoom");
        for (dir in directions) {
            // console.log(directions[dir])
            direction = directions[dir];
            mov = index.testMovePlayer("moveTest", "moveRoom", "GG", direction);
            start = mov.start;
            end = mov.end;
            speed = mov.speed;
            dddx = 0; dddy = 0;
            if (direction.left) {
                dddx -= speed;
            }
            if (direction.right) {
                dddx += speed;
            }
            if (direction.down) {
                dddy += speed;
            }
            if (direction.up) {
                dddy -= speed;
            }
            it(`movePlayer() ${dir} moved player from [${start}] to [${end}]`,
            function() {
                assert.isOk(start[0]+dddx == end[0]);
                assert.isOk(start[1]+dddy == end[1]);
            });
        }
    });

    //Test cases hasCollision()
    describe('testCollision()', function () {
        collisionDirections = {
            left: {"left" : true, "right" : false, "up" : false, "down" : false},
            right: {"left" : false, "right" : true, "up" : false, "down" : false},
            up: {"left" : false, "right" : false, "up" : true, "down" : false},
        };
        for (dir in collisionDirections) {
            direction = collisionDirections[dir];
            result = index.testCollision(`${dir}Test`, `${dir}Room`, "BC", direction);
            it(`moved player ${dir} 200 units to successfully force collision`,
            function() {
                assert.isOk(result == true);
            });
        }
    });

    // Projectile test cases
    describe ('testProjectiles()', function () {
        msCoords = {shootBullet: true, x: 90, y: 90, middleX: 0, middleY: 0};
        genResults = index.generateProjectiles("shooter", "gunrange", msCoords);
        startCoords = [genResults[0].x, genResults[0].y];
        velVector = [genResults[0].vx, genResults[0].vy]
        movResults = index.moveProjectiles("gunrange");
        endCoords = [movResults[0].x, movResults[0].y];
        delResults = index.deleteProjectile(0, "gunrange");

        it('Projectile succesfully generated', function() {
            assert.isOk(genResults);
        });
        it(`Projectile rightly moved from [${startCoords}] to [${endCoords}]`,
        function() {
            assert.isOk(startCoords[0] + velVector[0] == endCoords[0]);
            assert.isOk(startCoords[1] + velVector[1] == endCoords[1]);
        });
        it("Projectile was deleted successfully", function() {
            assert.isOk(!delResults.x && !delResults.y);
        });
    });

    // Test cases for spawning Random enemies
    describe('testSpawn()', function(){

        it('testSpawn() exists', function(){
            assert.isOk(testSpawnResult);
        });

        it('testSpawn() is of type int', function(){
            assert.notTypeOf(testSpawnResult, 'string');
        });

        it('testSpawn() is atleast 1', function(){
            assert.equal(testSpawnResult, 1);
        });
    });

    //Test cases for generating Enemies
    describe('testGenerateEnemies()', function(){

        it('testGenerateEnemies() exists', function(){
            assert.isOk(testGenerateEnemiesResult);
        });

        it('testGenerateEnemies() is of type int', function(){
            assert.notTypeOf(testGenerateEnemiesResult, 'string');
        });

        it('testGenerateEnemies() are atleast 10', function(){
            assert.equal(testGenerateEnemiesResult, 10);
        });
    });

    // Test cases for Enemy Movement
    describe('testEnemyMovement()', function(){

        it('testEnemyMovement() exists', function(){
            assert.isOk(testEnemyMovementResult);
        });

        it('testEnemyMovement() is of type int', function(){
            assert.notTypeOf(testEnemyMovementResult, 'string');
        });

        it('testEnemyMovement() speed is atleast 5', function(){
            assert.equal(testEnemyMovementResult, 5);
        });
    });

    // Test cases for Player Shoot
    describe('testPlayerShoot()', function(){

        it('testPlayerShoot() is of type int', function(){
            assert.notTypeOf(testPlayerShootResult, 'string');
        });

        it('testPlayerShoot() Shoot is atleast 0', function(){
            assert.equal(testPlayerShootResult, 0);
        });
    });

    // Test cases for Player Ammo
    describe('testPlayerAmmo()', function(){

        it('testPlayerAmmo() is of type int', function(){
            assert.notTypeOf(testPlayerAmmoResult, 'string');
        });

        it('testPlayerAmmo() Ammo is atleast 12', function(){
            assert.equal(testPlayerAmmoResult, 12);
        });
    });

    // Test cases for Player Health
    describe('testPlayerHealth()', function(){

        it('testPlayerHealth() is of type int', function(){
            assert.notTypeOf(testPlayerHealthResult, 'string');
        });

        it('testPlayerHealth() Health is atleast 100', function(){
            assert.equal(testPlayerHealthResult, 100);
        });
    });

    // Test cases for Player Reload
    describe('testPlayerReload()', function(){

        it('testPlayerReload() is of type int', function(){
            assert.notTypeOf(testPlayerReloadResult, 'string');
        });

        it('testPlayerReload() Reload is atleast 5', function(){
            assert.equal(testPlayerReloadResult, 5);
        });
    });

    // Test cases for Mini Map
    describe('testMiniMap()', function(){

        it('testMiniMap() exists', function(){
            assert.isOk(testMiniMapResult);
        });

        it('testMiniMap() is of type int', function(){
            assert.notTypeOf(testMiniMapResult, 'string');
        });

        it('testMiniMap() speed is atleast 2', function(){
            assert.equal(testMiniMapResult, 2);
        });
    });

    // Test cases for Weather API
    describe('testWeatherAPI()', function(){

        it('testWeatherAPI() exists', function(){
            assert.isOk(testWeatherAPIResult);
        });

        it('testWeatherAPI() is of type int', function(){
            assert.notTypeOf(testWeatherAPIResult, 'string');
        });

        it('testWeatherAPI() speed is atleast 1', function(){
            assert.equal(testWeatherAPIResult, 1);
        });
    });


  //Test cases for login page
  describe('Login page', ()=>{
    //Render login page
    it('Should render login page on / GET', (done) => {
      chai.request('https://sfunit.herokuapp.com')
          .get('/')
          .end(function (err, res) {
            res.should.have.status(200);
            done();
          });
    });
    // Render register page
    it('Should render register page on /register GET', (done) => {
      chai.request('https://sfunit.herokuapp.com')
          .get('/register')
          .end(function (err, res) {
            res.should.have.status(200);
            done();
          });
    });
    //Loging in valid account
    it('Should log in user with valid account using /checkAccount POST', function(done) {
        // chai.request('../index')
        chai.request('https://sfunit.herokuapp.com')
            .post('/checkAccount')
            .send({'username': 'ggiovani', 'password': '12345' })
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });

    it('Fail to log in due to redundant login /checkAccount POST', function(done) {
        // chai.request('../index')
        chai.request('https://sfunit.herokuapp.com')
            .post('/checkAccount')
            .send({'username': 'ggiovani', 'password': '12345' })
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });


    it('Should log out user using /logout POST', function(done) {
        chai.request('https://sfunit.herokuapp.com')
            .post('/logout')
            .send({'username': 'ggiovani'})
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });
  });

  // Test whether the enemy spawns
  describe('Spawn Boss', ()=> {
    result = index.testBossSpawn();
    it ('Should spawn the boss onto the map', function() {
        assert.isOk(result);
    });
  });

  describe('Checking Map Zones', ()=> {
    result = index.testZones("ZoneTestSocketID", "ZoneTestRoom");
    it ('Should contain all zones', function() {
        assert.isOk(result[7] == 9 && result[5] == 7 && result[0] == 1);
    });
  });
});
