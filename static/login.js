//Call a popup alert for failure in sign-up or sign-in


var msg = document.querySelector('#msg');
if (msg.innerHTML !='')
  {
    alert(msg.innerHTML);
  };

//Google sign out function
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    document.querySelector('#sign_in_para').style.display="block";
    document.querySelector('#convention_login').style.display = "block";
    document.querySelector('#gg_sign_in').style.display = "block";
    document.querySelector('#google_login').style.display = "none";
    document.querySelector('#sign_out_btn').style.display = "none";
  });
};

//Google authentification
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();

  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('Name: ' + profile.getName());
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  //Handling gg profile information
  ggRequest(profile);
};

//Check gg data with our DB and fill in gg login form
function ggRequest(profile){
  var data = {
    'username':profile.getName(),
    'gmail':profile.getEmail()
  };
  const options ={
    method: 'POST',
    headers:
    {
      "Content-Type":"application/json"
    },
    body: JSON.stringify(data)
  };
  fetch('/gglogin',options).then(response=>{
    document.querySelector('#sign_in_para').style.display="none";
    document.querySelector('#convention_login').style.display = "none";
    document.querySelector('#gg_sign_in').style.display = "none";
    document.querySelector('#google_login').style.display = "block";
    document.querySelector('#sign_out_btn').style.display = "block";
    document.querySelector('#username').value =String(data.username);
    document.querySelector('#gmail').value=String(data.gmail);
  });
};

// var btn =document.querySelector('#test_btn');
// btn.addEventListener('click',ggRequest);
