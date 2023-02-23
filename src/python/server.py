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

# Route for seeing a data
@app.route('/data', methods=['POST'])
def keywords():	
	req = json.loads(request.data)

	words = req["keywords"]

	print(int(req["latlong"]["distance"]))
	print(float(req["latlong"]["latitude"]))
	print(int(req["price"]))

	dt = datetime.now()

	id_list = [x.to_dict() for x in collection]

	print(len(id_list))

	user_loc = (req["latlong"]["latitude"], req["latlong"]["longitude"])
	
	print(user_loc)

	# for x in id_list: 
	# 	if geodesic(user_loc,(x["location"]['latitude'], x["location"]['longitude'])).miles <  int(req["latlong"]["distance"]):
	# 		print("check\n")

	id_list = [x for x in id_list if geodesic(user_loc,(x["location"]['latitude'], x["location"]['longitude'])).miles < int(req["latlong"]["distance"])]

	print(len(id_list))

	none_list = [x for x in id_list if x["attributes"] is None]

	id_list = [x for x in id_list if x["attributes"] is not None]

	print(len(id_list))

	priced_list = []

	for x in id_list:
		if "RestaurantsPriceRange2" in x["attributes"] and x["attributes"]["RestaurantsPriceRange2"] is not None:
			priced_list.append(x)
	
	priced_list = [y for y in priced_list if y["attributes"]["RestaurantsPriceRange2"] > int(req["price"])]

	print(len(id_list))

	for x in priced_list:
		id_list.remove(x)

	print(len(id_list))

	# id_list = [x for x in id_list if x["hours"][dt.strftime('%A')]["start"] <= req["time"]]

	# id_list = [x for x in id_list if x["hours"][dt.strftime('%A')]["end"] >= req["time"]]
	# id_list = [x for x in id_list if x["hours"][dt.strftime('%A')]["start"] <= req["time"]]

	# id_list = [x for x in id_list if req["halal"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["vegan"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["dairy"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["gluten"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["kosher"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["veggie"] in x["dietaryRestrictions"]["true"]]
	# id_list = [x for x in id_list if req["soy"] in x["dietaryRestrictions"]["true"]]
	
	# business_list = [doc["business_id"] for doc in id_list]

	# print(business_list, file=sys.stderr)

	# business_2 = df_business[df_business['business_id'].isin(business_list)]

	# def filter_func(id, row1, row2):
	# 	if (geodesic(user_loc,(row1, row2)).miles < float(req["latlong"]["distance"])):
	# 		business_list_final.append(id)
	# 		return True
	# 	else:
	# 		return False

	# business_2.apply(lambda x: filter_func(x['business_id'], x['latitude'], x['longitude']), axis=1)

	business_list_final = [x["business_id"] for x in id_list]

	Q2 = Q[Q.columns.intersection(business_list_final)]

	test_df= pd.DataFrame([words], columns=['text'])
	test_df['text'] = test_df['text'].apply(text_process)
	test_vectors = userid_vectorizer.transform(test_df['text'])
	test_v_df = pd.DataFrame(test_vectors.toarray(), index=test_df.index, columns=userid_vectorizer.get_feature_names_out())
	predictItemRating=pd.DataFrame(np.dot(test_v_df.loc[0],Q2),index=Q2.columns,columns=['Rating'])
	topRecommendations=pd.DataFrame.sort_values(predictItemRating,['Rating'],ascending=[0])[:7]

	print(topRecommendations.index.values.tolist(), file=sys.stderr)

	return topRecommendations.index.values.tolist()

	
@app.route('/google-maps-key', methods=['GET'])
def google_maps_key():
	return jsonify(key=GOOGLE_MAPS_KEY)

	
# Running app
if __name__ == '__main__':
	app.run(debug=True)
