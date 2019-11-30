//Main function when HTML initiate the game
//Note: not sure if we will have a Logout option so I'll do this structure for now
function game(){
  var authentication = false;
  while(!authentication){
    login();
  }
  gameContent();
}
