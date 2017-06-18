module.exports = function(app, passport, proxyApp) {
var authParams = require('../config/auth');
// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/proxy', function(req, res) {
		res.render('index.ejs');
	});

	app.post('/proxy', function(req, res) {
		authParams.openidconnectAuth.issuer = req.body.issuer;
		res.statusCode = 200;
		passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'});
		res.send("test")
	// 	// res.setHeader('Origin', req.headers.origin);
		// res.redirect('/auth/openidconnect');
	// app.get('/auth/openidconnect', passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'}));
	// 	// console.log(res);
	// 	// res.end();
	// 	// res.setHeader('Location', 'http://192.168.0.126:8090/auth/openidconnect');
	//   // res.statusCode = 301;
	//   // res.end();
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

	// openidconnect --------------------------------

		// send to openidconnect to do the authentication
		app.get('/connect/openidconnect', passport.authorize('openidconnect', { scope : 'email' }));

		// handle the callback after openidconnect has authorized the user
		app.get('/connect/openidconnect/callback',
			passport.authorize('openidconnect', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}