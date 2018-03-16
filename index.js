var express = require('express');
var session = require('express-session');
var bcrypt = require('bcrypt');

var app = express();

var ejs = require('ejs');

var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var PythonShell = require('python-shell');
//password file
var config = require('./config');

var path = require ('path');

const port = process.env.PORT || 8080;

//var Handlebars = require('handlebars');

var environment = process.env.NODE_ENV || "test";

console.log("ENVIRONMENT: " + environment);
//local vs production
if (process.env.NODE_ENV == "production"){
	mongo_user = process.env.MONGO_USER;
	mongo_pw = process.env.MONGO_PW;
	mongo_db = process.env.MONGO_DB;
	session_secret = process.env.SESSION_SECRET
} else {
	mongo_user = config.mongodb.user_name;
	mongo_pw = config.mongodb.user_pass;
	mongo_db = config.mongodb.db_name;
	session_secret = config.sessions.secret;
}

var sess;


//bodyParser
//app.use(bodyParser.urlencoded({extended: true}))

//mongodb
var mongo_link = "mongodb://"+mongo_user+":"
	+mongo_pw+"@ds151070.mlab.com:51070/startpage-test";

console.log("mongoDB link: " +mongo_link)	;

MongoClient.connect(mongo_link, (err, client)=>{
	if (err) return console.log(err)
	db = client.db(mongo_db);
	console.log("Connected to MongoDB");
	app.use(session({
		secret: session_secret,
		resave: true,
		saveUninitialized: true,
	}));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.engine('html', require('ejs').renderFile);

	app.set('view engine', 'ejs');




	app.get('/', function (req, res) {

		console.log("home get request");

		if(req.session.authenticated){
			console.log("it is a good session redirecting");
			renderMain(res);
		}else{
			console.log("not good request: " + req.session.authenticated + " redirecting");
			res.render("pages/login");
		}

	});



	app.post('/pw', function(req,res){
		console.log("login request received");

		user_in = JSON.parse(JSON.stringify(req.body));
		console.log("email is: " + user_in['email']);
		
		//check user_in password to make sure it equals the mongodb one
		//if it does then ???
		db.collection("users").findOne({'email':user_in['email']}, function(err, response){
			if(err) throw err;
			bcrypt.compare(user_in['password'], res.password_hash, function(err,response){
				req.session.authenticated = true;
				console.log("session is set to true: " + req.session.authenticated);
			});
		});

		renderMain(res);

	});


	//post from bookmarks form 
	app.post('/add-bookmark', function(req, res){
		bookmark_in = req.body
		console.log(bookmark_in)
 
		db.collection("bookmarks").insertOne(bookmark_in, function(err, res){
			if (err) throw err;
			console.log("1 bookmark added");
			PythonShell.run('python_jobs/pull_favicons.py', function(err){
				if(err) throw err;
				console.log("pull_favicons job done");
			});
		});

		renderMain(res);


	});

	app.post('/api/bm-del', function(req,res){
		console.log("Post delete bm request recevied");
		bm = JSON.parse(JSON.stringify(req.body));
		
		console.log(bm['name']);

		db.collection("bookmarks").deleteMany({ 'bookmark_name' : bm['name'] }, function(err, obj){
			if(err) throw err;
			console.log(obj.result);
			res.send(obj.result.n+" documents deleted");
		});
		//bm_parse = JSON.parse(bm_name);

		
	});

	//getting bookmarks for ajax request from list
	app.get('/api/bm', function(req, res){
		db.collection("bookmarks").find({}).sort({ 'bookmark_name' : 1}).toArray(function(err, result){
			if(err) throw err;
			res.send(result)
		});


	});
	//app.use('/things', things);

	app.listen(port);
	console.log('Running on http://localhost:8080');

});

function renderMain(res){
	db.collection("bookmarks").find().toArray(function(err, result){{
		console.log("redirecting to pages/main");
		if(err) throw err;
		res.render('pages/main', {book_in: result});
	}});
}

function checkAuth(req, res, next){
	console.log("checkAuth called");
	if(!req.session.authenticated){
		res.render('pages/login');
		return;
	}
	next();
}