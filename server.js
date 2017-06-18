// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8090;
var mongoose = require('mongoose');
var passport = require('passport');
var session  = require('express-session');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var authParams = require('./config/auth');

var fs = require('fs');
var http = require('http');
var https = require('https');
var app = require('express')();

app.use(bodyParser.urlencoded({extended: true}));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};
// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;



var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
// mongoose.connect(uristring, function (err, res) {
//   if (err) {
//   console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//   } else {
//   console.log ('Succeeded connected to: ' + uristring);
//   }
// });

//
// server = http.createServer(function (req, res) {
//   if (req.method == 'POST') {
//         var body = '';
//         req.on('data', function (data) {
//             body += data;
//         });
//         req.on('end', function () {
//             authParams.openidconnectAuth.issuer = body;
//             console.log(authParams.openidconnectAuth);
//             passport.authenticate('openidconnect', { scope : 'email' })
//         });
//
//   }
//   if (req.method == 'GET') {
//         var body = '';
//         req.on('data', function (data) {
//             body += data;
//         });
//         req.on('end', function () {
//             authParams.openidconnectAuth.issuer = body;
//             console.log(authParams.openidconnectAuth);
//             passport.authenticate('openidconnect', { scope : 'email' })
//         });
//     }
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     // res.setHeader('Location', 'http://localhost:8090/auth/openidconnect');
//     // res.statusCode = 301;
//     res.statusCode = 200;
//     res.end('http://localhost:8090/auth/openidconnect');
// });
//
//
// host = 'localhost';
// server.listen(8200, host);


require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
// https.createServer(options, app).listen(port, function () {
//   console.log('The magic happens on port ' + port);
// });
app.listen(port);
