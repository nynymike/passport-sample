var authParams = require('../config/auth');
var ipAddress = require('../config/ip');

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
