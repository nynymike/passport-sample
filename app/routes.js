var authParams = require('../config/auth');
var request = require('request');
// load the strategy we need
var OpenIdConnectStrategy = require('passport-openidconnect').Strategy;
// load up the user model
var User = require('../app/models/user');

module.exports = function (app, passport, request, ipAddress) {
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/proxy', function (req, res) {
        res.render('index.ejs');
    });

    // authenticate the client with issuer info received
    app.post('/proxy', function (req, res) {
        request.get('http://' + ipAddress + '/auth/openidconnect?issuer=' + req.body.issuer, function (error, response, body) {
            res.writeHead(response.statusCode, response.headers);
            res.write(body);
            res.end();
        });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/proxy');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================


    // openidconnect --------------------------------

    // send to openidconnect to do the authentication
    // app.get('/auth/openidconnect', passport.authenticate('openidconnect', { scope : 'email' , response_types: 'code'}));
    app.get('/auth/openidconnect',
        authenticate,
        passport.authenticate('openidconnect', {scope: 'email', response_types: 'code'}),
        function (req, res) {

        });


    function authenticate(req, res, next) {

        passport.use(new OpenIdConnectStrategy({
                // allows us to pass in the req from our route
                passReqToCallback: true, //(lets us check if a user is logged in or not)
                issuer: req.query.issuer,

            },


            function (req, iss, sub, profile, jwtClaims, accessToken, refreshToken, params, done) {
                // check if the user is already logged in
                if (!req.user) {
                    //
                    // find the user in the database based on their openidconnect id
                    User.findOne({'openidconnect.id': profile.id}, function (err, user) {

                        // if there is an error, stop everything and return that
                        // ie an error connecting to the database
                        if (err)
                            return done(err);

                        // if the user is found, then log them in
                        if (user) {
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user found with that openidconnect id, create them
                            var newUser = new User();

                            // set all of the openidconnect information in our user model
                            newUser.openidconnect.id = profile.id; // set the users openidconnect id
                            newUser.openidconnect.issuer = iss;
                            newUser.openidconnect.userName = profile._json.preferred_username;
                            newUser.openidconnect.displayName = profile.displayName;
                            newUser.openidconnect.idToken = params.id_token;

                            // save our user to the database
                            newUser.save(function (err) {
                                if (err)
                                    throw err;

                                // if successful, return the new user
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session
                    // update the current users openidconnect credentials
                    user.openidconnect.id = profile.id; // set the users openidconnect id
                    user.openidconnect.issuer = iss;
                    user.openidconnect.userName = profile._json.preferred_username;
                    user.openidconnect.displayName = profile.displayName;
                    user.openidconnect.idToken = params.id_token;

                    // save the user
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            }));
        next();
    }

    // handle the callback after openidconnect has authenticated the user
    app.get('/auth/openidconnect/callback', passport.authenticate('openidconnect', {
        successRedirect: '/profile',
        failureRedirect: '/proxy'
    }));
    // }), callbackResponse);

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/proxy');
}


function callbackResponse(req, res) {
    if (!req.user) {
        return res.redirect('/proxy');
    }
    console.log('User authenticated with: ' + req.user.openidconnect.issuer + ' Strategy with userid: ' + req.user.openidconnect.id);
    var queryUserString = encodeURIComponent(JSON.stringify(req.user.openidconnect));
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
