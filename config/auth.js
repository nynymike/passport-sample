module.exports = {

    'facebookAuth' : {
        'clientID'      : '114997209056735', // your App ID
        'clientSecret'  : '8614382600c17237849d4c05a895f432', // your App Secret
        'callbackURL'   : 'https://vast-refuge-14521.herokuapp.com/auth/facebook/callback',
        profileFields   : ['name','emails']
    },

    'openidconnectAuth' : {
        'clientID'      : '@!EDC1.2B96.1235.CBC7!0001!099F.E817!0008!7486.21E5.9387.05C3', // your App ID
        'clientSecret'  : 'secret', // your App Secret
        'callbackURL'   : 'https://vast-refuge-14521.herokuapp.com/auth/openidconnect/callback',
        'issuer'          : 'https://pkg-deb11.gluu.org/',
        'authorizationURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/authorize',
        'tokenURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/token',
        'userInfoURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/userinfo'
    },

    'openidAuth' : {
        'clientID'      : '@!EDC1.2B96.1235.CBC7!0001!099F.E817!0008!7486.21E5.9387.05C3', // your App ID
        'clientSecret'  : 'secret', // your App Secret
        'returnURL'   : 'http://localhost:8080/auth/openid/callback',
        'realm'          : 'http://localhost:8080/',
        'providerURL'          : 'https://pkg-deb11.gluu.org',
        'issuer'          : 'https://pkg-deb11.gluu.org/',
        'authorizationURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/authorize',
        'tokenURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/token'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
