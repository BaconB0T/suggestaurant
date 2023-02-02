import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, Timestamp, doc, setDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";

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
const analytics = getAnalytics(firebaseApp);


// TODO: Authorization happens on Firestore's end and
// that needs to be setup still. Currently, anybody
// can do anything to the database.

/**
 * Returns all the restaurants in a list
 * @returns a list of all restaurants in the db.
 */
async function getAllRestaurants() {
  const restaurantsCol = collection(db, 'restaurants');
  const restaurantsSnapshot = await getDocs(restaurantsCol);
  const restaurantsList = restaurantsSnapshot.docs.map(doc => {
    const docData = doc.data();
    docData.id = doc.id;
    return docData;
  });
  console.log(restaurantsList);
  return restaurantsList;
}

/**
 * Retrieves the restaurant from firestore by its id, or null
 * if there is no restaurant by the given id.
 * @param {String} id The id of the Restaurant
 * @returns The restaurant as an object or null.
 */
async function getRestaurantById(id) {
  id = String(id)
  const docRef = doc(db, 'restaurants', id);
  return getRestaurant(docRef);
}

/**
 * Returns the restaurant as a firebase document, or null if no document
 * exists at that reference.
 * @param {reference} docRef a doc reference
 * @returns The restaurant, or null
 */
async function getRestaurant(docRef) {
  try {
    const docSnap = await getDoc(docRef);
    const doc = docSnap.data();
    doc.id = docSnap.id;
    return doc;
  } catch(e) {
    console.log(e);
    return null;
  }
}

/**
 * 
 * @returns All accounts in the database.
 */
async function getAllAccounts() {
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  const usersList = usersSnapshot.docs.map(doc => {
    const docData = doc.data();
    docData.id = doc.id;
    return docData;
  });
  return usersList;
}

/**
 * Returns true if the a username or email is already used by another
 * user in the database.
 * 
 * @param {Object} doc - Must contain email and username fields.
 * @returns A Promise that resolves to true if the email or username is already in use or false if not.
 */
async function emailOrUsernameUsed(doc) {
  if(doc.email == null || doc.username == null) {
    throw new Error("doc must contain username and email!");
  }
  try {
    const usernameCheck = await getAccount("username", doc.username);
    const emailCheck = await getAccount("email", doc.email);
    if(usernameCheck != null || emailCheck != null) {
      return true;
    }
  } catch(e) {
    console.error(e);
  }
  return false;
}

/**
 * Gets one account based on the given field.
 * @param {String} field - Can be one of 'username' or 'email'
 * @param {String} value - The value the given `field` should be equal to.
 * @returns A reference to the document where `field` == `value` or null if no document 
 * exists.
 */
async function getAccount(field, value) {
  if(!['username', 'email'].includes(field)) {
    throw new Error("Field must be either username or email");
  }

  const usersCol = collection(db, 'users');
  const q = query(usersCol, where(`${field}`, '==', `${value}`));
  
  const querySnapshot = await getDocs(q);
  // const docs = querySnapshot.docs.map((doc) => doc.data());
  
  const docs = querySnapshot.docs;
  if(docs.length === 0) {
    return null;
  } else {
    const doc = docs[0].data()
    doc.id = docs[0].id;
    return doc;
  }
}

/**
 * 
 * @param {String} username 
 * @param {String} password 
 * @returns {Boolean} true if username/password are valid
 */
async function validateUser(username, password) {
  let account = await getAccount("username", username);

  // TODO We need to hash the password when we store it
  // TODO THEN we need to hash the given password to check it!

  if (account && account.password === password) {
    return true;
  }
  return false;
}

/**
 * Inserts an account into the users collection. `account` must include `password`, `account`,
 * and `username`, and it may include any of the following:<br>
 * - `dietaryRestrictions` - a list of strings as found in the database. See `TODO: Put
 * reference here` for what fields are allowed.<br>
 * - `excludedCuisines` - a list of references to cuisines. See `TODO: Put reference here`
 * for what values are allowed.
 * - `preferences` - a list of filters that define the users preferences. See `TODO: Put 
 * reference here` for what values are allowed.
 * @param {Object} account - Must include `username`, `email`, and `password` fields.
 * @returns 
 */
async function insertAccount(account) {
  const diet = account.dietaryRestrictions ? account.dietaryRestrictions : [];
  const exCui = account.excludedCuisines ? account.excludedCuisines : [];
  const pref = account.preferences ? account.preferences : defaultPreferences();
  const docData = {
    // id: account.username,
    email: account.email,
    password: account.password,
    username: account.username,
    // password: encrypt(account.password),
    filters: {
      dietaryRestrictions: diet,
      excludedCuisines: exCui,
      preferences: pref,
    },
  };
  // TODO: Check if that user exists already

  // Then insert
  const accRef = await setDoc(doc(db, 'users', `${account.id}`), docData);
  await setDoc(doc(db, 'users', `${account.id}`, 'history', 'placeholder'), defaultHistory())
  return accRef;
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
    restaurant: 'placeholder'
  });
}

// function Holder()
// {
//     const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);
// }

async function rateRestaurant(restObject, restRating, user){
  let text1 = "users/";
  // const user = cookies.get("Name") || "";
  let text2 = user + '/history/';
  let finalText = text1.concat(text2);
  // console.log("rateRestaurant finalText")
  // console.log(finalText);

  const historyItem = {
    dateAdded: Timestamp.now(),
    rating: restRating,
    restaurant: doc(db, `/restaurants/${restObject.id}`)
  };

  // console.log("restObject")
  // console.log(restObject)
  // const myArray = restObject.split("/");
  // console.log("myArray")
  // console.log(myArray)
  // let word = myArray[2];
  // console.log("rateRestaurant finalText.concat(word)")
  // console.log(finalText.concat(word));
  // console.log('doc final path')
  // console.log(`users/${user}/history/${restObject.id}`)
  const location = doc(db, `users/${user}/history/${restObject.id}`);

  // console.log("after doc");

  setDoc(location, historyItem);

  // console.log("After setDoc");
}  

async function deleteHistoryItem(user, hisotryDoc){
  let usrHis = "users/" + user + "/history/";

  const location = doc(db, `users/${user}/history/${hisotryDoc.id}`);
  // console.log(hisotryDoc.id);
  // console.log(location);
  deleteDoc(location);

}

async function getHistory(user)
{
  // const user = cookies.get("Name") || "";
  const historyCol = collection(db, 'users/' + user + '/' + 'history');
  const historySnapshot = await getDocs(historyCol);
  // const histList = historySnapshot.docs.map(doc => doc.data());
  let historyList = [];
  for(const hist of historySnapshot.docs) {
    let histor = hist.data();
    histor.id=hist.id;
    // console.log("Hist id in getHistory");
    // console.log(hist.id);
    historyList.push(histor);
  }
  // console.log("historyList");
  // console.log(historyList);
  historyList = historyList.filter((elem) => {
    if(elem.restaurant !== 'placeholder') {
      return elem;
    }
  });
  return historyList;
}

async function historyItem(historyDoc)
{ 
  const retVal = 
  {
    date: historyDoc.getString("dateAdded"),
    rating: historyDoc.getString("rating"),
    restaurant: historyDoc.getString("restaurant")
  }
  return retVal;
}



export { db, analytics,getRestaurantById, getRestaurant, getAllRestaurants, getAllAccounts, insertAccount, getAccount, emailOrUsernameUsed, rateRestaurant, deleteHistoryItem, getHistory, validateUser, historyItem }
