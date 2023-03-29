# Import flask and datetime module for showing date and time
from flask import Flask, jsonify
from flask import request
from flask_cors import CORS
import json, os
import firebase_admin
from firebase_admin import firestore
from geopy.distance import geodesic
from dotenv import load_dotenv;
import sys
from google.api_core.retry import Retry
import multiprocessing
from functools import partial



import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords 
from nltk.tokenize import WordPunctTokenizer
from datetime import datetime

import nltk
from nltk.corpus import stopwords
load_dotenv()

GOOGLE_MAPS_KEY=os.getenv("GOOGLE_MAPS_API_KEY")
API_KEY=os.getenv("API_KEY")
MESSAGING_SENDER_ID=os.getenv("MESSAGING_SENDER_ID")
APP_ID=os.getenv("APP_ID")

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
stopwords = stopwords.words('english')
df_business = pd.read_json('restaurants.json')

import string
from nltk.corpus import stopwords
stop = []
for word in stopwords.words('english'):
    s = [char for char in word if char not in string.punctuation]
    stop.append(''.join(s))


def text_process(mess):
    # Check characters to see if they are in punctuation
    nopunc = [char for char in mess if char not in string.punctuation]
    # Join the characters again to form the string.
    nopunc = ''.join(nopunc)
    
    # Now just remove any stopwords
    return " ".join([word for word in nopunc.split() if word.lower() not in stop])

cred_obj = firebase_admin.credentials.Certificate(config['serviceAccount'])
default_app = firebase_admin.initialize_app(cred_obj, config)


db = firestore.client()

import pickle
input = open('userid_vectorizer.pkl', 'rb')

userid_vectorizer = pickle.load(input)

input.close()

input = open('Q.pkl', 'rb')

Q = pickle.load(input)

input.close()

collection = db.collection('restaurants').get(retry=Retry())

# collection = [x.to_dict() for x in collection]

# with open('parrot.pkl', 'wb') as f:
# 	pickle.dump(collection, f)

# Initializing flask app
app = Flask(__name__)

# deal with CORS security issues
CORS(app)

def insert_restaurants_as_suggestions(ids_list, group_id):
	groupDocRef = db.document('groups', group_id)
	groupDoc = groupDocRef.get().to_dict()
	suggestion_data = groupDoc['suggestions'] if 'suggestions' in groupDoc.keys() else dict()
	for rest_id in ids_list:
		suggestion_data[rest_id] = dict(numAccepted=0, numRejected=0)
	groupDocRef.update({'suggestions': suggestion_data})

def MyFilterFunction(x, user_loc, req):
	if geodesic(user_loc,(x["location"]['latitude'], x["location"]['longitude'])).miles < int(req):
		return x
	return None

# Route for seeing a data
@app.route('/data', methods=['POST'])
def keywords():	
	req = json.loads(request.data)

	try:
		cpus = multiprocessing.cpu_count()
	except NotImplementedError:
		cpus = 2   # arbitrary default

	print(int(req["latlong"]["distance"]))
	print(float(req["latlong"]["latitude"]))
	print(int(req["price"]))

	dt = datetime.now()

	words = req["keywords"]

	id_list = [x.to_dict() for x in collection]

	for x in id_list:
		acceptedKeys = ["attributes", "hours", "dietaryRestrictions", "business_id", "location"]
		for a in list(x.keys()):
			if a not in acceptedKeys:
				x.pop(a)
		if x["attributes"] is not None and "RestaurantsPriceRange2" in x["attributes"]:
			x["attributes"] = x["attributes"]["RestaurantsPriceRange2"]
		if x["attributes"] is not None:
			x["attributes"] = None
		print(x["attributes"])
	
	user_loc = (req["latlong"]["latitude"], req["latlong"]["longitude"])

	pool = multiprocessing.Pool(processes=cpus)
	parallelized = pool.map(partial(MyFilterFunction, user_loc, req["latlong"]["distance"]), id_list)

	id_list = [x for x in parallelized if x]

	# id_list = [x for x in id_list if geodesic(user_loc,(x["location"]['latitude'], x["location"]['longitude'])).miles < int(req["latlong"]["distance"])]

	none_list = [x for x in id_list if x["attributes"] is None]

	id_list = [x for x in id_list if x["attributes"] is not None]

	priced_list = []

	for x in id_list:
		if "RestaurantsPriceRange2" in x["attributes"] and x["attributes"] is not None:
			priced_list.append(x)
	
	priced_list = [y for y in priced_list if y["attributes"] > float(req["price"])]

	for x in priced_list:
		id_list.remove(x)

	if req["groupCode"] == 0:
		time = int(req["time"].replace(':', ''))
	else:
		time = req["time"]
	
	dayList = []

	for x in id_list:
		if x["hours"] is not None:
			if dt.strftime('%a') in x["hours"]:
				dayList.append(x)

	dayList = [x for x in dayList if x["hours"][dt.strftime('%A')]["end"] <= time]
	dayList = [x for x in dayList if x["hours"][dt.strftime('%A')]["start"] >= time]

	for x in dayList:
		id_list.remove(x)

	diet_list = []

	for x in id_list:
		if x["dietaryRestrictions"] is not None:
			if x["dietaryRestrictions"]["true"] is not None:
				diet_list.append(x)

	diet_list = [x for x in diet_list if req['diet']["Halal"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Vegan"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Dairy-free"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Gluten-free"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Kosher"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Vegetarian"] in x["dietaryRestrictions"]["true"]]
	diet_list = [x for x in diet_list if req['diet']["Soy-free"] in x["dietaryRestrictions"]["true"]]
	
	businesslist_final = [x["business_id"] for x in id_list]

	Q2 = Q[Q.columns.intersection(businesslist_final)]

	test_df= pd.DataFrame([words], columns=['text'])
	test_df['text'] = test_df['text'].apply(text_process)
	test_vectors = userid_vectorizer.transform(test_df['text'])
	test_v_df = pd.DataFrame(test_vectors.toarray(), index=test_df.index, columns=userid_vectorizer.get_feature_names_out())
	predictItemRating=pd.DataFrame(np.dot(test_v_df.loc[0],Q2),index=Q2.columns,columns=['Rating'])
	topRecommendations=pd.DataFrame.sort_values(predictItemRating,['Rating'],ascending=[0])[:7]

	print(topRecommendations.index.values.tolist(), file=sys.stderr)

	if str(req['groupCode']) != '0':
		insert_restaurants_as_suggestions(topRecommendations.index.values.tolist(), req['groupCode'])

	return topRecommendations.index.values.tolist()


@app.route('/google-maps-key', methods=['GET'])
def google_maps_key():
	return jsonify(key=GOOGLE_MAPS_KEY)


# This code was rendered irrelevant by handling group quiz data updates in react
# @app.route('/groupMode', methods=['POST'])
# def setGroupData():
# 	req = json.loads(request.data)
# 	group_ref = db.collection(u"groups").document(req["groupCode"])

# 	group_get = group_ref.get().to_dict()

# 	group_keywords = group_get["keywords"] +  " " + req["keywords"]

# 	group_price = group_get["price"].append(req["price"])

# 	# Atomically add a new region to the 'keywords' array field.
# 	group_ref.update({u'keywords': group_keywords})
# 	group_ref.update({u'price'}, group_price)
# 	group_ref.update({u'halal'}, req["halal"])
# 	group_ref.update({u'vegan'}, req["vegan"])
# 	group_ref.update({u'veggie'}, req["veggie"])
# 	group_ref.update({u'gluten'}, req["gluten"])
# 	group_ref.update({u'kosher'}, req["kosher"])
# 	group_ref.update({u'soy'}, req["soy"])
# 	group_ref.update({u'dairy'}, req["soy"])

# 	if req["host"] == 1:
# 		group_ref.update({u'latlong'}, req["latlong"])
# 		group_ref.update({u'time'}, req["time"])

# 	return 0

	
# Running app
if __name__ == '__main__':
	app.run(debug=True)
