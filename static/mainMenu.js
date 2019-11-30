//This section IS NOT done yet
function mainMenu(){
  //isGameStart is used for starting the game level, will be reset to false everytime the game level ends
  var isGameStart = false;
  var teamList = [];
  var globalPlayerList = [];
  while(!isGameStart){
    if(receiveUpdate()){
      if(receiveInvite()){
        processInvited();
      }
      updateTeamInfo();
      updateGlobalRooms();
      updateGlobalPlayers();
      displayTeam();
      displayGlobalMenu();
    }
    updateStartButton()
  }
}

//check to see if receive new info from server
function receiveUpdate(){
  return false;
}

//check to see if invite in sent to player
function receiveInvite(){
  return false;
}

//wait for player to prompt the answer to the received invitation (yes/no/invite other player). If yes, player joins the other player's room
function processInvited(){

}

//get info of all players in room
function updateTeamInfo(){

}

//get info of all active game rooms
function updateGlobalRooms(){

}

//get info of all players currently online
function updateGlobalPlayers(){

}

//display all info about team, including interaction areas (only room host can see start button)
function displayTeam(){

}


//display available rooms/players menu
function displayGlobalsMenu(){
  displayGlobalRooms();
  displayGlobalPlayer();
}

//display all game rooms online
function displayGlobalRooms(){

}

//display all players that are not in rooms
function displayGlobalPlayers(){

}

//update Start button depends on the ready condition (Start button can be pressed)
function updateStartButton(){

}
