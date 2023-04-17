# Imports
from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os, sys
import firebase_admin
from firebase_admin import firestore
from dotenv import load_dotenv;
from google.api_core.retry import Retry
import numpy as np
import pandas as pd
from nltk.corpus import stopwords 
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.tokenize import WordPunctTokenizer
from parallelizer import *
import nltk
import pickle
import string
import time as t
import copy
import random

# load environment for map
load_dotenv()

# map API prep
GOOGLE_MAPS_KEY=os.getenv("GOOGLE_MAPS_API_KEY")
API_KEY=os.getenv("API_KEY")
MESSAGING_SENDER_ID=os.getenv("MESSAGING_SENDER_ID")
APP_ID=os.getenv("APP_ID")

# map API config
config = {
  "apiKey": API_KEY,
  "authDomain": "suggestaurant-873aa.firebaseapp.com",
  "projectId": "suggestaurant-873aa",
  "storageBucket": "suggestaurant-873aa.appspot.com",
  "messagingSenderId": MESSAGING_SENDER_ID,
  "appId": APP_ID,
  "measurementId": "G-XGH587V93D",
  "serviceAccount": "./suggestaurant-873aa-d6566e2cfc10.json"
}

nltk.download('stopwords')

# prep algorithm parser
stop = []
for word in stopwords.words('english'):
    s = [char for char in word if char not in string.punctuation]
    stop.append(''.join(s))


# text processor for algorithm
def text_process(mess):
    # Check characters to see if they are in punctuation
    nopunc = [char for char in mess if char not in string.punctuation]
    # Join the characters again to form the string.
    nopunc = ''.join(nopunc)
    
    # Now just remove any stopwords
    return " ".join([word for word in nopunc.split() if word.lower() not in stop])

# database connection initialization
cred_obj = firebase_admin.credentials.Certificate(config['serviceAccount'])
default_app = firebase_admin.initialize_app(cred_obj, config)

# database object
db = firestore.client()

# import user vectorizer for model
input = open('userid_vectorizer.pkl', 'rb')
userid_vectorizer = pickle.load(input)
input.close()

# import model
input = open('Q.pkl', 'rb')
Q = pickle.load(input)
input.close()

# initialize restaurant collection
collection = db.collection('restaurants').get(retry=Retry())
collection = [x.to_dict() for x in collection]

# data cleaning, remove all but necessary data
for x in collection:
	acceptedKeys = ["attributes", "hours", "dietaryRestrictions", "business_id", "location", "categories", "stars"]
	for a in list(x.keys()):
		if a not in acceptedKeys:
			x.pop(a)
	if x["attributes"] is None:
		x["GoodForKids"] = False
	if x["attributes"] is not None and "GoodForKids" in x["attributes"]:
		x["GoodForKids"] = x["attributes"]["GoodForKids"]
	if x["attributes"] is not None and "GoodForKids" not in x["attributes"]:
		x["GoodForKids"] = False
	if x["attributes"] is not None and "RestaurantsPriceRange2" not in x["attributes"]:
		# CONSIDER USING TEMP VALUE HERE TO MAINTAIN STRUCTURE
		x["attributes"] = None
	if x["attributes"] is not None and "RestaurantsPriceRange2" in x["attributes"]:
		x["attributes"] = x["attributes"]["RestaurantsPriceRange2"]


# Initializing flask app
app = Flask(__name__)

# deal with CORS security issues
CORS(app)

def userHandler(req, id_list):
	if req["userinfo"]["fastFood"]:
		id_list = [s for x in id_list if "Fast Food" not in x["categories"]]

	if req["userinfo"]["exclude"]:
		for y in req["userinfo"]["exclude"]:
			id_list = [x for x in id_list if y not in x["categories"]]

	if req["userinfo"]["includeHistory"]:
		for y in req["userinfo"]["includeHistory"]:
			id_list = [x for x in id_list if x["business_id"] == y]
			
	if req["userinfo"]["minRating"]:
		id_list = [x for x in id_list if x["stars"] >= req["userinfo"]["minRating"]]

	if req["userinfo"]["familyFriendly"]:
		id_list = [x for x in id_list if x["GoodForKids"] is True]
	
	return id_list


# this uploads restaurants to group DB object for group mode
# Overwrites suggestion data since for subsequent runs, client doesn't
# have a way to find the new list for group members. 
def insert_restaurants_as_suggestions(ids_list, group_id):
	groupDocRef = db.document('groups', group_id)
	# groupDoc = groupDocRef.get().to_dict()
	suggestion_data = dict()
	# suggestion_data = groupDoc['suggestions'] if 'suggestions' in groupDoc.keys() else dict()
	for rest_id in ids_list:
		suggestion_data[rest_id] = dict(numAccepted=0, numRejected=0)
	groupDocRef.update({'suggestions': suggestion_data})

def getRandomRestaurants(collection):
	"""Returns a set of 7 unique restaurants randomly chosen."""
	suggestions = set()

	while len(collection) >= 7 and len(suggestions) != 7:
		s = collection[int(random.random() * len(collection))]
		suggestions.add(s)
	print(list(suggestions))
	return list(suggestions)

# route for running algorithm model
@app.route('/data', methods=['POST'])
def keywords():

	# timer for testing purposes
	start = t.time()

	# load data from website
	req = json.loads(request.data)

	# load keywords from website data
	words = req["keywords"]

	# user location data
	user_loc = (req["latlong"]["latitude"], req["latlong"]["longitude"])

	print("Restaurants before Distance Culling: " + str(len(collection)))

	id_list = distanceHandlerParallel(user_loc, req, collection)
	
	if(len(id_list)) == 0:
		return "1"

	print("Restaurants after Distance Culling: " + str(len(id_list)))
	
	none_list = [x for x in id_list if x["attributes"] is None]

	id_list = [x for x in id_list if x["attributes"] is not None]
	
	id_list = [x for x in id_list if x["attributes"] < float(req["price"])]

	print("Restaurants after Price Culling: " + str(len(id_list)))

	if(len(id_list)) == 0:
		return "2"
	
	id_list = id_list + none_list

	print("Restaurants after No-Price replacement: " + str(len(id_list)))

	time = int(str(req["time"]).replace(':', ''))
	
	id_list = timeHandlerParallel(time, id_list)

	print("Restaurants after Time-Based Culling: " + str(len(id_list)))

	if(len(id_list)) == 0:
		return "3"

	id_list = allergyHandlerParallel(req, id_list)

	print("Restaurants after Allergy-Based Culling: " + str(len(id_list)))

	if(len(id_list)) == 0:
		return "4"

	if(req["userinfo"] and req["groupCode"] == 0):
		id_list = userHandler(req, id_list)

	if(len(id_list)) == 0:
		return "5"
	
	# final list of restaurant ids for processing
	businesslist_final = [x["business_id"] for x in id_list]

	if 'random' in req.keys() and req['random']:
		return getRandomRestaurants(businesslist_final)
	
	# cull model to just usable restaurant ids
	Q2 = Q[Q.columns.intersection(businesslist_final)]

	# run the model
	test_df= pd.DataFrame([words], columns=['text'])
	test_df['text'] = test_df['text'].apply(text_process)
	test_vectors = userid_vectorizer.transform(test_df['text'])
	test_v_df = pd.DataFrame(test_vectors.toarray(), index=test_df.index, columns=userid_vectorizer.get_feature_names_out())
	predictItemRating=pd.DataFrame(np.dot(test_v_df.loc[0],Q2),index=Q2.columns,columns=['Rating'])
	topRecommendations=pd.DataFrame.sort_values(predictItemRating,['Rating'],ascending=[0])[:7]

	print(topRecommendations.index.values.tolist(), file=sys.stderr)

	if str(req['groupCode']) != '0':
		insert_restaurants_as_suggestions(topRecommendations.index.values.tolist(), req['groupCode'])
	
	end = t.time()
	print("Total time: " + str(end - start))

	return topRecommendations.index.values.tolist()

# map function
@app.route('/google-maps-key', methods=['GET'])
def google_maps_key():
	return jsonify(key=GOOGLE_MAPS_KEY)
	
# Running app
if __name__ == '__main__':
	app.run(debug=True)
