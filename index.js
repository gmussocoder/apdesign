/**
 * Launches the API Listener
 * 
 * Checkout the API implementation in api/v1/vacations.js
 */

// Setup the DB_URI
process.env.DB_URI = require("./db/clouddb").DB_URI

var express = require('express');
//La siguiente línea es para autorización basic:
var basicauth = require(__dirname + '/basicauth')

var bodyParser = require('body-parser')

var router = express.Router();
require('./api/v1/vacations')(router);

require('./api/v1/hotels')(router);

// Create the express app
app = express();

//La siguiente línea es para autorización basic:
var auth = basicauth.auth

// Setup the body parser
//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());//{type: '*/*'}));

// Setup the app to use the router
app.use(router);

// Start the listener
app.listen(3000);
console.log('Listening on 3000')

