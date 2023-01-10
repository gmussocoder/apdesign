/**
 * Contains the definition of the API endpoints for vacation packages
 */
// As a best practice keep the resource name same as the file name
var RESOURCE_NAME = 'vacations';
var VERSION = 'v1';
var URI = '/' + VERSION + '/' + RESOURCE_NAME;


const { ObjectId } = require('mongoose');
// Setup the vacations db
var db = require('../../db/vacations')
var apiErrors = require('../../util/errors')
var apiMessages = require('../../util/messages')

//La siguiente línea es para validación con Token:
var auth = require('./token')
var jwtValidate = require(__dirname + '../../tokens/validator')
auth = jwtValidate.auth
//La siguiente Línea es para Basic Auth: 
//var basicauth = require(__dirname + '../../../basicauth')
//var auth = basicauth.auth



// La siguiente variable es para el Cache-Control:
var MAX_AGE = 10;
module.exports = function (router) {
    'use strict';

    // RETRIEVE all active vacation packages
    // Active = validTill >= Today's date

    //    /v1/Vacations
    //Se agrega "auth" para basic auth:
    router.route(URI).get(auth, function (req, res, next) {
        console.log("GET Vacations")
        //1. Setup query riteria for the active pacakages
        var criteria = { validTill: { $gte: new Date() } }

        //2. execute the query
        db.select(criteria, function (err, docs) {

            if (err) {
                console.log(err)
                res.status(500)
                res.send("Error connecting to db")
            } else {
                if (docs.length == 0) {
                    res.status(404)
                }
                console.log("Retrieved vacations = %d", docs.length)
                res.header('Cache-Control', 'private, max-age='+MAX_AGE)
                res.send(docs)
            }
        });
    });
    // Solution to the problem - Extend the vacations API to add RETRIEVAL of specific vacation package
    // v1/vacations/:id
    //Se agrega "auth" para basic auth:
    router.route(URI+"/:name").get(auth, function (req, res, next) {
        var name = req.params.name || ''

        if (name === '') {
            res.sendStatus(400)
            return
        }
        console.log("GET Vacations : %s", name)
        //1. Setup query riteria for the active pacakages
        // In addition to the date check we need to look for a package with the name received in request
        // Added name: { $eq : name} to the criteria
        var criteria = { validTill: { $gte: new Date()}, name: { $eq : name} }

        //2. Select
        db.select(criteria, function (err, docs) {

            if (err) {
                console.log(err)
                res.status(500)
                res.send("Error connecting to db")
            } else {
                if (docs.length == 0) {
                    res.status(404)
                }
                console.log("Retrieved vacations = %d", docs.length)
                res.send(docs)
            }
        });
    });

    // CREATE new vacation packages
    router.route(URI).post(function (req, res, next) {
        console.log("POST  Vacations")

        //1. Get the data
        var doc = req.body;

        //2. Call the insert method
        db.save(doc, function (err, saved) {
            if (err) {
                // Creates the error response
                // EARLIER it was >>>  res.status(400).send("err")
                var userError = processMongooseErrors(apiMessages.errors.API_MESSAGE_CREATE_FAILED, "POST", URI, err,{});
                res.setHeader('content-type', 'application/json')
                res.status(400).send(userError)
            } else {
                res.header('Cache-Control', 'private, max-age='+MAX_AGE)
                res.send(saved)
            }
        });
    });
/*
    router.route(URI).put('id', function (req, res, next) {
        console.log("PUT  Vacations")

        //1. Get the data
        const itemId = req.params.id;
        const updateOffer = req.body;
        db.collection('vacations').findOneAndUpdate({ _id: ObjectId(itemId)}, {$set: updateOffer}, function (err, result) {
            if (err) {
                // Creates the error response
                // EARLIER it was >>>  res.status(400).send("err")
                var userError = processMongooseErrors(apiMessages.errors.API_MESSAGE_CREATE_FAILED, "PUT", URI, err,{});
                res.setHeader('content-type', 'application/json')
                res.status(400).send(userError)
            } else {
                res.header('Cache-Control', 'private, max-age='+MAX_AGE)
                res.send(result);
            }
        });
    });*/
}
/**
 * Converts the Mongoose validation errors to API specific errors
 */
var processMongooseErrors = function (message, method, endpoint, err,payload) {
    var errorList = []
    // Check for validation error
    if (err.name === 'ValidationError'){
        errorList = processValidationErrors(err)
    } else if(err.code == 11000){
        // it could be database error - 11000 is for duplicate key
        errorList.push(apiErrors.errors.PACKAGE_ALREADY_EXISTS)
    } else {
        var errUnknown = apiErrors.errors.UNKNOWN_ERROR
        errUnknown.payload = err
        errorList = [apiErrors.errors.UNKNOWN_ERROR]
    }
    return apiErrors.create(message, method, endpoint, errorList, payload)
}

/**
 * Converts Mongoose errors to API specific errors
 */
var processValidationErrors = function (err) {
    var errorList = []
    // Check if there is an issue with the Num of Nights
    if (err.errors.numberOfNights) {
        if (err.errors.numberOfNights.kind === apiErrors.kinds.MIN_ERROR 
        || err.errors.numberOfNights.kind  === apiErrors.kinds.MAX_ERROR 
        || err.errors.numberOfNights.kind === apiErrors.kinds.NUMBER_ERROR ) {
            errorList.push(apiErrors.errors.FORMAT_NUM_OF_NIGHTS)
        }
    }
    // Check if name of the package is missing
    if (err.errors.name) {
        if (err.errors.name.kind === apiErrors.kinds.REQUIRED) {
            errorList.push(apiErrors.errors.MISSING_PACKAGE_NAME)
        }
    }

    // Check if description of the package is missing
    if (err.errors.description) {
        if (err.errors.description.kind === apiErrors.kinds.REQUIRED) {
            errorList.push(apiErrors.errors.MISSING_PACKAGE_DESCRIPTION)
        }
    }

    return errorList;
}

/*
Código de referencia
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

// Replace with your own MongoDB database URL
const mongodbUrl = 'mongodb://localhost:27017';

// Connect to the MongoDB database
MongoClient.connect(mongodbUrl, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Connected to MongoDB');

  // Get a reference to the "items" collection
  const itemsCollection = client.db('mydatabase').collection('items');

  // PUT route to update an item
  app.put('/items/:id', (req, res) => {
    // Read the item ID and updated data from the request body
    const itemId = req.params.id;
    const updatedData = req.body;

    // Update the item in the "items" collection
    itemsCollection.updateOne(
      { _id: itemId },
      { $set: updatedData },
      (err, result) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
          return;
        }

        // Return a success response 
*/