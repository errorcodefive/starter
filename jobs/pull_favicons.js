var MongoClient = require('mongodb').MongoClient
var config = require('../config');
var request = require('request');
var http = require('http');
var fs = require('fs');
var express = require('express');


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
		if (err) return console.log(err)
		console.log("Pulled bookmarks");
		bm_list = result;

		console.log(bm_list);

		//for each bookmark
		for (var x =0; x<bm_list.length; x++){
			//get url
			var query_url = bm_list[x].bookmark_url
			var favicon_name = bm_list[x].bookmark_name + ".ico"
			var request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
			  response.pipe(favicon_name);
			});
			query_url = 'http://www.google.com/s2/favicons?domain=' + query_url;
			console.log(query_url);

		};
	});

	client.close();
	
});