var RESOURCE_NAME = 'token';
var VERSION = 'v1';
var URITOKEN = '/' + VERSION + '/' + RESOURCE_NAME;

//Las siguientes líneas son para Autorización con Token:
var jwtAuth = require(__dirname + '../../tokens/jwtauth')
var auth = jwtAuth.auth
// This is the passport middlewae function tha get called first
module.exports = function (router) {
    'use strict';
    router.route(URITOKEN).post(auth,function(req, res){
        res.send('token');
    });
}