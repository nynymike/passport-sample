var ip = require('ip');

module.exports = function(port) { return ip.address() + ':' + port;}
