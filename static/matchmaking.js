var searchBtn = document.getElementById('searchButton');
var username = document.getElementById('username');
username = username.innerHTML
searchBtn.value = username;
searchBtn.addEventListener('click', function(event) {
    searchBtn.value = username;
});

// var logoutButton = document.getElementById('log_out_button');
// logoutButton.addEventListener('click', function(event) {
//   logoutButton.value = username;
// });