/**
 * Setup the Database URL
 */

 // mongodb+srv://admin:<password>@cluster0-46e5h.mongodb.net/test?retryWrites=true&w=majority

 //Este es mi enlace al Mongodb:
//mongodb+srv://gmusso:<password>@cluster0.u8vjook.mongodb.net/?retryWrites=true&w=majority
const DB_USER = "gmusso"
const DB_PASSWORD = "teco123"
const DB_NAME = "acmetravel"
const CLUSTER_HOST = "cluster0.u8vjook.mongodb.net"

// Setup the DB URI
exports.DB_URI= "mongodb+srv://"+DB_USER+":"+DB_PASSWORD+"@"+CLUSTER_HOST+"/"+DB_NAME+"?retryWrites=true&w=majority"