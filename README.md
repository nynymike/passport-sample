# Passport Proxy

## Description
This node proxy app allows the authentication of OpenID Connect clients to its respective Identity Provider(IP). It receives the issuer URL that the client is supposed to be authenticated against and sets the configuration parameters for the passport strategy with client and issuer info. Once the authentication succeeds it redirects the client to its respective callback URI registered on the IP.

## Diagram

![](/proxy-workflow.png)

## Client Request
The client request for authentication is done by adding a query parameter "issuer" when requesting the "auth/openidconnect" route of the proxy.

    https://example.domain.com/auth/openidconnect?issuer=example.issuerURL.org

## Strategy Configuration
The strategy configuration uses a modified and improved passport-openidconnect strategy. Originally this strategy requires the parameters that could be assigned automatically through discovery procedure applied to the issuer URL, like authorization endpoint, token endpoint and userInfo endpoint. It also requires clientID, clientSecret and callbackURL. Those are saved on a js file that will be explained in the next section. For this modified strategy the configuration only requires the issuer URL. The strategy configuration may be done by the following example

    passport.use(new OpenIdConnectStrategy({
        // allows us to pass in the req from our route
        passReqToCallback: true, //(lets us check if a user is logged in or not)
        issuer: req.query.issuer

    }


## passport-openidconnect

The remaining information that was originally required by passport-openidconnect is discovered and saved on this new strategy. The issuer information (authorization endpoint, token endpoint and userInfo endpoint) are discovered and the clientInfo are supposed to be saved on a JSON object in the `clientInfo.js` file. Each tuple of client information (clientID, clientSecret, callbackURL) is associated with its respective issuer URL. Then this feature considers that the proxy knows the information of all clients that it may interact with and also allows each issuer to be associated with only one client. An example of the `clientInfo.js` is presented below

    module.exports = {
      'http://example.issuerURL.org' : {
        clientID      : CLIENT-ID,
        clientSecret  : CLIENT-SECRET,
        callbackURL   : CLIENT-CALLBACK,
      }
    };

