module.exports = function(app, passport, request) {
var authParams = require('../config/auth');
var ipAdress = require('../config/ip');
// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/proxy', function(req, res) {
		res.render('index.ejs');
	});

	// authenticate the client with issuer info received
	app.post('/proxy', function(req, res) {
		authParams.openidconnectAuth.issuer = req.body.issuer;
		request.get(ipAdress + ':8090/auth/openidconnect', function (error, response, body) {
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

var callbackResponse = function(req, res) {
    if (!req.user) {
        return res.redirect('/proxy');
    }
		console.log(req.user.openidconnect);
    console.log('User authenticated with: ' + req.user.openidconnect.issuer + ' Strategy with userid: ' + req.user.openidconnect.id);
    var queryUserString = encodeURIComponent(JSON.stringify(req.user.openidconnect));
    return res.redirect(ipAdress + ':8080/auth/realms/master/protocol/openid-connect/userinfo?user=' + queryUserString);
};