var express = require('express');

var app = express();

var ejs = require('ejs');

var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
//password file
var config = require('./config');
var path = require ('path');

const port = process.env.port || 8080;

//var Handlebars = require('handlebars');

//bodyParser
//app.use(bodyParser.urlencoded({extended: true}))

//mongodb
var mongo_link = "mongodb://"+config.mongodb.user_name+":"
	+config.mongodb.user_pass+"@ds151070.mlab.com:51070/startpage-test";

console.log("mongoDB link: " +mongo_link)	


MongoClient.connect(mongo_link, (err, client) =>{
	if (err) return console.log(err)
		db = client.db(config.mongodb.db_name)
		console.log("Connected to MongoDB")

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	app.engine('html', require('ejs').renderFile);

	app.set('view engine', 'ejs');

	app.get('/', function (req, res) {
		
		//sending bookmarks

		db.collection("bookmarks").find().toArray(function(err, result){{
			if(err) throw err;
			res.render('pages/main', {book_in: result});
		}})
	});



	//post from bookmarks form
	app.post('/add-bookmark', function(req, res){
		bookmark_in = req.body
		console.log(bookmark_in)

		db.collection("bookmarks").insertOne(bookmark_in, function(err, res){
			if (err) throw err;
			console.log("1 bookmark added");
		});

		db.collection("bookmarks").find().toArray(function(err, result){{
			if(err) throw err;
			res.render('pages/main', {book_in: result})
		}});

		// res.render('partials/bookmarks_list', { book_in: db.collection("bookmarks").find({}).toArray(function(err, result){
		// 	if(err) throw err;

		// })});
	});


	//app.use('/things', things);

	app.listen(port);
	console.log('Running on http://localhost:8080');

});

function renderMain(db, res){
	db.collection("bookmarks").find().toArray(function(err,result){{
		if(err) throw err;
		res.render('pages/main', {book_in: result});
	}})
};