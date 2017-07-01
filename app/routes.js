var authParams = require('../config/auth');
var ipAddress = require('../config/ip');
// load the strategy we need
var OpenIdConnectStrategy = require('passport-openidconnect').Strategy;
// load up the user model
var User = require('../app/models/user');

module.exports = function(app, passport, request) {
// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/proxy', function(req, res) {
		res.render('index.ejs');
	});

	// authenticate the client with issuer info received
	app.post('/proxy', function(req, res) {
		asignIssuer(req.body.issuer);
		console.log(authParams.openidconnectAuth.issuer);
		request.get('http://devdomain.org:8090/auth/openidconnect', function (error, response, body) {
			res.writeHead(response.statusCode, response.headers);
			res.write(body);
			res.end();
		});
	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/proxy');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================


	// openidconnect --------------------------------
		// app.use(function (req, res, done) {
		// 	if (req.query.issuer) {
		// 			console.log(req.query.issuer);
		// 			done();
		// 	} else {
		// 			done();
		// 	}
		// });

		// send to openidconnect to do the authentication
		// app.get('/auth/openidconnect', passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'}));
		app.get('/auth/openidconnect', authenticate, function(){});


		function authenticate (req, res, next){

			passport.use(new OpenIdConnectStrategy({

	        passReqToCallback : true, // allows us to pass in the req from our route
	                                  //(lets us check if a user is logged in or not)

	        // pull in our app id and secret from our auth.js file

	        // =====================================================================
	        // PASSPORT-OPENIDCONNECT===============================================
	        // =====================================================================
	        // (github.com/jaredhanson/passport-openidconnect)

	        // clientID        : configAuth.openidconnectAuth.clientID,
	        // clientSecret    : configAuth.openidconnectAuth.clientSecret,
	        // callbackURL     : configAuth.openidconnectAuth.callbackURL,
	        // issuer          : configAuth.openidconnectAuth.issuer,
	        // authorizationURL : configAuth.openidconnectAuth.authorizationURL,
	        // tokenURL : configAuth.openidconnectAuth.tokenURL,
	        // userInfoURL: configAuth.openidconnectAuth.userInfoURL,

	        // =====================================================================
	        // PASSPORT-OPENIDCONNECT===============================================
	        // =====================================================================
	        // (github.com/toledorafael/passport-openidconnect)

	        issuer          : req.query.issuer,

	    } ,


	    function(req, iss, sub, profile, jwtClaims, accessToken, refreshToken, params, done) {
	      // asynchronous
	      // var options = {
	      //   url: 'http://devdomain.org:8080/auth/realms/master/protocol/openid-connect/userinfo',
	      //   headers: {
	      //     'Authorization': 'Bearer ' + accessToken
	      //   }
	      // };
	      // request.get(options, function (error, response, body) {
				// 	var userInfo = JSON.parse(body);
				// 	console.log(userInfo);
				// });
	      process.nextTick(function() {
	          // check if the user is already logged in
	          if (!req.user) {

	              // find the user in the database based on their openidconnect id
	              User.findOne({ 'openidconnect.id' : profile.id }, function(err, user) {

	                  // if there is an error, stop everything and return that
	                  // ie an error connecting to the database
	                  if (err)
	                      return done(err);

	                  // if the user is found, then log them in
	                  if (user) {
	                      return done(null, user); // user found, return that user
	                  } else {
	                      // if there is no user found with that openidconnect id, create them
	                      var newUser            = new User();

	                      // set all of the openidconnect information in our user model
	                      newUser.openidconnect.id    = profile.id; // set the users openidconnect id
	                      newUser.openidconnect.issuer = iss;
	                      // newUser.openidconnect.email = ;
	                      newUser.openidconnect.displayName = profile.displayName;
	                      newUser.openidconnect.accessToken = params.access_token;
	                      newUser.openidconnect.idToken = params.id_token;

	                      // save our user to the database
	                      newUser.save(function(err) {
	                          if (err)
	                              throw err;

	                          // if successful, return the new user
	                          return done(null, newUser);
	                      });
	                  }

	              });

	          } else {
	              // user already exists and is logged in, we have to link accounts
	              var user            = req.user; // pull the user out of the session

	              // update the current users openidconnect credentials
	              user.openidconnect.id    = profile.id; // set the users openidconnect id
	              user.openidconnect.issuer = iss;
	              // user.openidconnect.email = ;
	              user.openidconnect.displayName = profile.displayName;
	              user.openidconnect.accessToken = params.access_token;
	              user.openidconnect.idToken = params.id_token;

	              // save the user
	              user.save(function(err) {
	                  if (err)
	                      throw err;
	                  return done(null, user);
	            });
	        }
	    });
		}));

			passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'})(req, res, next)
		}

		// handle the callback after openidconnect has authenticated the user
		app.get('/auth/openidconnect/callback', passport.authenticate('openidconnect', {
				successRedirect : '/profile',
				failureRedirect : '/proxy'
			}));
		// }), callbackResponse);

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
	return next();

	res.redirect('/proxy');
}

function asignIssuer(issuer) {
	authParams.openidconnectAuth.issuer = issuer;
}

function callbackResponse(req, res) {
	if (!req.user) {
		return res.redirect('/proxy');
	}
	console.log('User authenticated with: ' + req.user.openidconnect.issuer + ' Strategy with userid: ' + req.user.openidconnect.id);
	var queryUserString = encodeURIComponent(JSON.stringify(req.user.openidconnect));
	console.log(req.user);
	var options = {
		url: req.authInfo.state.userInfoURL,
		headers: {
			'Authorization': 'Bearer ' + req.user.openidconnect.accessToken
		}
	};
	request.post(options, function (error, response, body) {
		var userInfo = JSON.parse(body);
		console.log(userInfo);
	});
};
