import urllib.request
import pymongo
import json
import os
import boto3

from pymongo import MongoClient


try:
	if(os.environ['NODE_ENV']=='production'):
		mongo_user = os.environ['MONGO_USER']
		mongo_pw = os.environ['MONGO_PW']
		mongo_db = os.environ['MONGO_DB']
		access_key = os.environ['AWS_ACCESS_KEY']
		secret_key= os.environ['AWS_SECRET_KEY']
		bucket_name = os.environ['S3_BUCKET_NAME']
		aws_region = os.environ['S3_REGION']
	else:
		config_path=(os.path.join(os.path.dirname(__file__), 'config_py.json'))
		configs = json.load(open(config_path))
		mongo_user = configs['mongodb_user_name']
		mongo_pw = configs['mongodb_user_pass']
		mongo_db = configs['mongodb_db_name']
		access_key = configs['aws_access_key']
		secret_key = configs['aws_secret_key']
		bucket_name = configs['s3_bucket_name']
		aws_region = configs['s3_region']
except: 
	config_path=(os.path.join(os.path.dirname(__file__), 'config_py.json'))
	configs = json.load(open(config_path))
	mongo_user = configs['mongodb_user_name']
	mongo_pw = configs['mongodb_user_pass']
	mongo_db = configs['mongodb_db_name']
	access_key = configs['aws_access_key']
	secret_key = configs['aws_secret_key']
	bucket_name = configs['s3_bucket_name']
	aws_region = configs['s3_region']
	
mongo_link = "mongodb://"+mongo_user+":"+mongo_pw+"@ds151070.mlab.com:51070/startpage-test"
client = MongoClient(mongo_link)
print("mongodb link: "+mongo_link)

db = client[mongo_db]
bookmarks = db['bookmarks']
print(bookmarks)

for bm in bookmarks.find():
	#get urlpymongo

	print(bm['bookmark_url'])
	fav_url = bm['bookmark_url']
	fav_name = bm['bookmark_name']+'.ico'
	#create favicon link
	fav_url = 'http://www.google.com/s2/favicons?domain=' + fav_url
	#download favicon
	urllib.request.urlretrieve(fav_url, fav_name)
	#upload to s3
	s3_client = boto3.client(
		's3',
		aws_access_key_id = access_key,
		aws_secret_access_key = secret_key)

	to_s3_icon = open(fav_name, 'rb')
	s3_client.put_object(Bucket=bucket_name,Key=("bm/"+fav_name), Body = to_s3_icon)
	to_s3_icon.close()
	print(fav_name + "Put out to S3")
	#delete local favicon
	os.remove(fav_name)
	#assign key to db entry for bookmark
	bookmarks.update_one({'bookmark_name': bm['bookmark_name']},
		{'$set': {'bookmark_favicon': ("bm/"+fav_name)}})
	print("mongodb updated")