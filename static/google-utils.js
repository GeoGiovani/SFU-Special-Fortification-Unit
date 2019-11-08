import { google } from 'googleapis';

const googleConfig = {
  clientId: '724640681185-50sh73ojcn61bg4uinoohvhf9s0b73ga.apps.googleusercontent.com',
  clientSecret: 'Z9nCaY0vDsBqA_f8qGdDq2iN',
  redirect: 'https://sfunit.herokuapp.com/checkAccount'
};

/**
 * Create the google auth object which gives us access to talk to google's apis.
 */
function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}