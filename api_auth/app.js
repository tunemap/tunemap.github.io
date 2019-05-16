var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
const path = require('path');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '3e9fae56a04f4e3cb4b367254f710042'; // Your client id
var client_secret = '30c42bc987c443bd91cb19347b933a93'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var redirect_uri_share = 'http://localhost:8888/callbackshare'; // Your redirect uri for sharing

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

// Init app
var app = express();

// middleware that serves all files in /public to / on server
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function(req, res) {

  // generates a random string for the state 
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  /* * application requests authorization based upon the scoped we give it here
  **'http://localhost:8888/callback'; is our redirect URI so after spotify handles login 
  **it will route back to that endpoint of our app
  */
  var scope = 'user-read-private user-top-read user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

// HERE IS THE REDIRECT URI HANDLER
app.get('/callback', function (req, res) {
  
  // application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  // error handler for a state mismatch
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    /*
    we are sending a post request to https://accounts.spotify.com/api/token in order to turn our
    authorization code into a access token and refresh token
    */
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // save tokens
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;

        // we can also pass the token to the browser to make requests from there
        res.redirect('/image-map.html#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

// endpoint allows for the refresh of a token
app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

var idValue;

app.get('/share', function (req, res) {
  idValue = req.query.id;
  res.redirect('http://localhost:8888/login-share');
});

app.get('/login-share', function(req, res) {

  // generates a random string for the state
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  //requests authorization
  var scope = 'user-read-private user-top-read user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri_share,
      state: state
    }));
});

app.get('/callbackshare', function (req, res) {
  //requests refresh and access tokens
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri_share,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      console.log(error);
      console.log(response.statusCode);
      if (!error && response.statusCode === 200) {
        console.log(error);
        console.log(response.statusCode);
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;

        res.redirect('/share-map.html#' +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token,
          idValue: idValue
        }));
      } else {
        console.log(error);
        console.log(response.statusCode);
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

//PORT 
const port = process.env.PORT || 8888;
//Start server
app.listen(port, function(){
    console.log(`Server started on port ${port}...`);
});
