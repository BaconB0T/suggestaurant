import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc } from 'firebase/firestore/lite';
import { doc, setDoc, Timestamp } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I",
  authDomain: "suggestaurant-873aa.firebaseapp.com",
  projectId: "suggestaurant-873aa",
  storageBucket: "suggestaurant-873aa.appspot.com",
  messagingSenderId: "1095104791586",
  appId: "1:1095104791586:web:cc8a3de7a061762c84f67b",
  measurementId: "G-XGH587V93D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

async function getRestaurants() {
  const restaurantsCol = collection(db, 'restaurants');
  const restaurantsSnapshot = await getDocs(restaurantsCol);
  const restaurantsList = restaurantsSnapshot.docs.map(doc => doc.data());
  return restaurantsList;
}

async function rateRestaurant(restObject, restRating){
  let text1 = "users/";
  let text2 = 'i7Bs7uChMXB5oacg0Dln' + '/history/';
  let finalText = text1.concat(text2);
  console.log(finalText);
  const historyItem = {
    dateAdded: Timestamp.now(),
    rating: restRating,
    restaurant: restObject
  };
  const myArray = restObject.split("/");
  let word = myArray[2];
  console.log(finalText.concat(word));
  const location = doc(db, finalText.concat(word));
  console.log("after doc");
  setDoc(location, historyItem);
  console.log("After setDoc");
}  

async function getHistory()
{
  const historyCol = collection(db, 'i7Bs7uChMXB5oacg0Dln' + '/' + 'history');
  const historySnapshot = await getDocs(historyCol);
  const histList = historySnapshot.docs.map(doc => doc.data());
  return histList;
}

// skeleton project
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

rateRestaurant("/restaurants/1", 0);

export default App;
