// config/passport.js

// load the strategy we need we need
var OpenIdConnectStrategy = require('passport-openidconnect').Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // =========================================================================
    // OPENIDCONNECT============================================================
    // =========================================================================
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

        issuer          : configAuth.openidconnectAuth.issuer,

    } ,


    function(req, iss, sub, profile, jwtClaims, accessToken, refreshToken, params, done) {
      // asynchronous
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
}
