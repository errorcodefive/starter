var MongoClient = require('mongodb').MongoClient
var config = require('./config');
var mongo_link = "mongodb://"+process.env.MONGO_USER+":"
	+process.env.MONGO_PW+"@ds151070.mlab.com:51070/startpage-test";

console.log("mongoDB link: " +mongo_link)	
