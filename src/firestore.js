import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc, Timestamp, doc, setDoc, DocumentReference } from "firebase/firestore";

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

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp)

// auth service account? This is for Node.js, NOT React.
// We can't use the admin sdk in our context because everything
// is sent to the client. 

// TODO: Authorization happens on Firestore's end
// and that needs to be setup still

// const admin = require("firebase-admin");
// const serviceAccount = require("./suggestaurant-873aa-d6566e2cfc10.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

async function getRestaurants() {
  const restaurantsCol = collection(db, 'restaurants');
  const restaurantsSnapshot = await getDocs(restaurantsCol);
  const restaurantsList = restaurantsSnapshot.docs.map(doc => doc.data());
  return restaurantsList;
}

async function getAccounts() {
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  const usersList = usersSnapshot.docs.map(doc => doc.data());
  return usersList;
}

async function insertAccount(account) {
  const accRef = await addDoc(collection(db, 'users'), {
    id: account.get('username'),
    email: account.get('email'),
    password: account.password,
    // password: encrypt(account.password),
    filters: {
      dietaryRestrictions: account.get('dietaryRestrictions', []),
      excludedCuisines: account.get('excludedCuisines', []),
      preferences: account.get('preferences', defaultPreferences()),
    },
  });

  // make history subcollection
  addDoc(collection(db, 'users', `${accRef.id}`, 'history'), defaultHistory());
  return accRef
}

function defaultPreferences() {
  return ({
    includeFastFood: true,
    includeHistory: true,
    minimumRating: 1,
    requireFamilyFriendly: false
  })
}

function defaultHistory() {
  return ({
    dateAdded: Timestamp.now(),
    rating: 0,
    restaurant: 'this is just a placeholder'
  })
}

export { db, analytics, getRestaurants, getAccounts, insertAccount }