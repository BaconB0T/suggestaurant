# Import flask and datetime module for showing date and time
from flask import Flask
from flask import request
from flask_cors import CORS
import json

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords 
from nltk.tokenize import WordPunctTokenizer

import nltk
from nltk.corpus import stopwords
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

import pickle
input = open('userid_vectorizer.pkl', 'rb')

userid_vectorizer = pickle.load(input)

input.close()

input = open('Q.pkl', 'rb')

Q = pickle.load(input)

input.close()

# Initializing flask app
app = Flask(__name__)

# deal with CORS security issues
CORS(app)

# Route for seeing a data
@app.route('/data', methods=['POST'])
def keywords():
	words = json.dumps(request.json)
	test_df= pd.DataFrame([words], columns=['text'])
	test_df['text'] = test_df['text'].apply(text_process)
	test_vectors = userid_vectorizer.transform(test_df['text'])
	test_v_df = pd.DataFrame(test_vectors.toarray(), index=test_df.index, columns=userid_vectorizer.get_feature_names_out())
	predictItemRating=pd.DataFrame(np.dot(test_v_df.loc[0],Q),index=Q.columns,columns=['Rating'])
	topRecommendations=pd.DataFrame.sort_values(predictItemRating,['Rating'],ascending=[0])[:7]
	return topRecommendations.index.values.tolist()

	

	
# Running app
if __name__ == '__main__':
	app.run(debug=True)
