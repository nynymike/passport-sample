module.exports = {

    'facebookAuth' : {
        'clientID'      : '114997209056735', // your App ID
        'clientSecret'  : '8614382600c17237849d4c05a895f432', // your App Secret
        'callbackURL'   : 'http://localhost:8090/auth/facebook/callback',
        profileFields   : ['name','emails']
    },

    'openidconnectAuth' : {
        'clientID'      : 'Passport-Test2', // your App ID
        'clientSecret'  : '3aa6c917-6bcc-4f91-bffb-c4ebbc8df5eb', // your App Secret
        'callbackURL'   : 'http://localhost:8090/auth/openidconnect/callback',
        'issuer'          : 'http://localhost:8080/auth/realms/master',
        'authorizationURL' : 'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
        'tokenURL' : 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
        'userInfoURL' : 'http://localhost:8080/auth/realms/master/protocol/openid-connect/userinfo'
        // 'clientID'      : '@!EDC1.2B96.1235.CBC7!0001!099F.E817!0008!7486.21E5.9387.05C3', // your App ID
        // 'clientSecret'  : 'segredo', // your App Secret
        // 'callbackURL'   : 'https://mydomain.com:8090/auth/openidconnect/callback',
        // 'issuer'          : 'https://pkg-deb11.gluu.org/',
        // 'authorizationURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/authorize',
        // 'tokenURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/token',
        // 'userInfoURL' : 'https://pkg-deb11.gluu.org/oxauth/seam/resource/restv1/oxauth/userinfo'
    }

};
