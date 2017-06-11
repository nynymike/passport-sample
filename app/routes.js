module.exports = function(app, passport, proxyApp) {
var authParams = require('../config/auth');
// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs');
		// if (req.method == 'POST') {
	  //   var body = '';
	  //   req.on('data', function (data) {
	  //       body += data;
	  //   });
		// 	console.log(body);
	  //   req.on('end', function () {
	  //       // authParams.openidconnectAuth.issuer = body;
	  //       console.log(authParams.openidconnectAuth);
	  //       // passport.authenticate('openidconnect', { scope : 'email' })
	  //   });
	  // }
	  // if (req.method == 'GET') {
	  //   var body = '';
	  //   req.on('data', function (data) {
	  //       body += data;
	  //   });
	  //   req.on('end', function () {
	  //       authParams.openidconnectAuth.issuer = body;
	  //       console.log(authParams.openidconnectAuth);
	  //       passport.authenticate('openidconnect', { scope : 'email' })
	  //   });
	  // }
		// // Website you wish to allow to connect
		// res.setHeader('Access-Control-Allow-Origin', '*');
		//
		// // Request methods you wish to allow
		// res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		//
		// // Request headers you wish to allow
		// res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
		//
		// // Set to true if you need the website to include cookies in the requests sent
		// // to the API (e.g. in case you use sessions)
		// res.setHeader('Access-Control-Allow-Credentials', true);
	  // res.setHeader('Location', 'http://192.168.0.126:8090/auth/openidconnect');
	  // res.statusCode = 301;
	  // // res.statusCode = 200;
	  // res.end();
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
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('loginMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// openidconnect --------------------------------
		app.use(function (req, res, done) {
			if (req.query.issuer) {
					console.log(req.query.issuer);
					done();
			} else {
					done();
			}
		});

		// send to openidconnect to do the authentication
		app.get('/auth/openidconnect', passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'}));

		// handle the callback after openidconnect has authenticated the user
		app.get('/auth/openidconnect/callback',
			passport.authenticate('openidconnect', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));



// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// openidconnect --------------------------------

		// send to openidconnect to do the authentication
		app.get('/connect/openidconnect', passport.authorize('openidconnect', { scope : 'email' }));

		// handle the callback after openidconnect has authorized the user
		app.get('/connect/openidconnect/callback',
			passport.authorize('openidconnect', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// openidconnect --------------------------------
	app.get('/unlink/openidconnect', function(req, res) {
		var user           = req.user;
		user.openidconnect.idToken = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}