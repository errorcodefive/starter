var MongoClient = require('mongodb').MongoClient
var config = require('../config');


var rp = require('request-promise');
var cheerio = require('cheerio');

var environment = process.env.NODE_ENV || "test";

console.log(environment);

if (environment == "production"){
	mongo_user = process.env.MONGO_USER;
	mongo_pw = process.env.MONGO_PW;
	mongo_db = process.env.MONGO_DB;

} else {
	mongo_user = config.mongodb.user_name;
	mongo_pw = config.mongodb.user_pass;
	mongo_db = config.mongodb.db_name;
}


var mongo_link = "mongodb://"+mongo_user+":"
	+mongo_pw+"@ds151070.mlab.com:51070/startpage-test";

console.log("mongoDB link: " +mongo_link)	

MongoClient.connect(mongo_link, (err, client)=>{
	if (err) return console.log(err)
	db = client.db(mongo_db);
	
	console.log("Connected to MongoDB");

	//scrape each site in database collection for favicons
	//get all bookmarks
	var bm_list;
	db.collection("bookmarks").find().toArray(function(err, result){
		if(err) return console.log(err)
		console.log("Pulled bookmarks");
		bm_list = result;

		console.log(bm_list);

		//for each bookmark
		for (var x =0; x<bm_list.length; x++){
			//get url
			var query_url = bm_list[x].bookmark_url
			var options = {
				uri: query_url,
				transform: function(body){
					return cheerio.load(body);
				}
			};

			//pull html

			rp(options)
				.then(function(htmlString){
					console.log(htmlString);
				})
				.catch(function(err){
					console.log("link is broken");
				});
			//find favicon link
			//download favicon link



		};
	});

	client.close();
	
});