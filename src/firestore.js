import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, signInAnonymously, sendPasswordResetEmail, updatePassword } from "firebase/auth"
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, getDocs, getDoc, Timestamp, doc, setDoc, deleteDoc, updateDoc, query, where, limit, onSnapshot, getCountFromServer } from "firebase/firestore";

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
const auth = getAuth(firebaseApp);
const supportedMemberGroupKeys = ['diet', 'keywords', 'price', 'users'];
const supportedHostGroupKeys = supportedMemberGroupKeys.concat('latlong', 'time');

// localize OAuth flow to user's preferred language.
auth.languageCode = 'it';
auth.useDeviceLanguage();

const storage = getStorage(firebaseApp);
const analytics = getAnalytics(firebaseApp);
const googleProvider = new GoogleAuthProvider();
// additional OAuth 2.0 scopes: 
// googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

// For each of your app's pages that need 
// information about the signed-in user, attach
//  an observer to the global authentication 
// object. This observer gets called whenever 
// the user's sign-in state changes.
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     // User is signed in, see docs for a list of available properties
//     // https://firebase.google.com/docs/reference/js/firebase.User
//     const uid = user.uid;
//     // ...
//   } else {
//     // User is signed out
//     // ...
//   }
// });

// TODO: Authorization happens on Firestore's end and
// that needs to be setup still. Currently, anybody
// can do anything to the database.

/**
 * TODO: Paginate this query.
 * Returns all the restaurants in a list
 * @returns a list of all restaurants in the db.
 */
async function getAllRestaurants() {
  const restaurantsCol = collection(db, 'restaurants');
  // const restaurantsSnapshot = await getDocs(restaurantsCol);
  const restaurantsSnapshot = await getDocs(query(restaurantsCol, limit(100)));
  const restaurantsList = restaurantsSnapshot.docs.map(doc => {
    const docData = doc.data();
    docData.id = doc.id;
    return docData;
  });
  // console.log(restaurantsList);
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
 * 
 * @deprecated see getDocument
 * 
 * @param {reference} docRef a doc reference
 * @returns The restaurant, or null
 */
async function getRestaurant(docRef) {
  // return getDocument(docRef);
  try {
    const docSnap = await getDoc(docRef);
    const doc = docSnap.data();
    doc.id = docSnap.id;
    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * Gets a document from firestore. Returns null on fail.
 * 
 * @param {reference} docRef 
 * @returns A document object with its `id`. 
 */
async function getDocument(docRef) {
  try {
    const docSnap = await getDoc(docRef);
    const doc = docSnap.data();
    doc.id = docSnap.id;
    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getRestaurantBy(field, value) {
  // if(!['business_id', 'isOpen'].includes(field)) {
  //   throw new Error("Field must be one of username, email, or uid.");
  // }
  const restCol = collection(db, 'restaurants');
  const q = query(restCol, where(`${field}`, '==', `${value}`));

  const querySnapshot = await getDocs(q);
  // const docs = querySnapshot.docs.map((doc) => doc.data());

  let docs = querySnapshot.docs;
  if (docs.length === 0) {
    return null;
  } else {
    let docsData = docs.map((doc) => doc.data());
    for (let i = 0; i < docsData.length; ++i) {
      docsData[i].uid = docs[i].uid;
    }
    return docsData;
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
  if (doc.email == null || doc.username == null) {
    throw new Error("doc must contain username and email!");
  }
  try {
    const usernameCheck = await getAccount("username", doc.username);
    const emailCheck = await getAccount("email", doc.email);
    if (usernameCheck != null || emailCheck != null) {
      return true;
    }
  } catch (e) {
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
  if (!['username', 'email', 'uid'].includes(field)) {
    throw new Error("Field must be one of username, email, or uid.");
  }

  const usersCol = collection(db, 'users');
  const q = query(usersCol, where(`${field}`, '==', `${value}`));

  const querySnapshot = await getDocs(q);
  // const docs = querySnapshot.docs.map((doc) => doc.data());

  const docs = querySnapshot.docs;
  if (docs.length === 0) {
    return null;
  } else {
    const doc = docs[0].data()
    doc.uid = docs[0].id;
    // console.log(doc);
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
  // TODO: Use firebase's auth services here!

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
 * and `username`, and it may include any of the following:
 * - `dietaryRestrictions` - a list of strings as found in the database. See `TODO: Put
 * reference here` for what fields are allowed.<br>
 * - `excludedCuisines` - a list of references to cuisines. See `TODO: Put reference here`
 * for what values are allowed.
 * - `preferences` - a list of filters that define the users preferences. See `TODO: Put 
 * reference here` for what values are allowed.
 * @param {Object} account - Must include `username`, `email`, and `password` fields.
 * @returns 
 */
async function insertAccount(accountData) {
  // insert
  const accRef = await setDoc(doc(db, 'users', `${accountData.uid}`), accountData);
  await setDoc(doc(db, 'users', `${accountData.uid}`, 'history', 'placeholder'), defaultHistory())
  return accRef;
}

async function createUserEmailPassword(username, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // signed in
    const user = userCredential.user;
    insertAccount(userObj({uid: user.uid, displayName: username, email: email}, 'local'));
    return { uid: user.uid, name: username };
  } catch (error) {
    console.error(error);
    alert(error.message);
    // string: auth/specific-reason
    return null;
  }
}

function userObj(user, provider) {
  return {
    uid: user.uid,
    email: user.email,
    username: user.displayName,
    // No need for password, firesbase handles that for us.
    authProvider: provider,
    filters: {
      dietaryRestrictions: [],
      excludedCuisines: [],
      preferences: defaultPreferences(),
    },
  }
}

async function signInEmailPassword(email, password) {
  try {
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    return { bool: true, idOrCode: userCreds.user.uid };
  } catch (error) {
    console.error(error);
    return { bool: false, idOrCode: error.code };
  };
}

// idek if this works (or signInWithProviderRedirect).
// May have to be called in the react component?
function signInWithGoogleMobile() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // Gives google access token. Can use to access Google API
      const credential = googleProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      getDocs(q).then((docs) => {
        if (docs.docs.length === 0) {
          insertAccount({
            uid: user.uid,
            email: user.email,
            username: user.displayName,
            // No need for password, firesbase handles that for us.
            authProvider: "google",
            filters: {
              dietaryRestrictions: [],
              excludedCuisines: [],
              preferences: defaultPreferences(),
            },
          });
        }
      });
      // IdP data avail using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      console.error(error);
      // const email = error.customData.email;
      // const credential = googleProvider.credentialFromError(error);
    });
}

async function signInWithGoogle() {
  const result = await signInWithPopup(getAuth(), new GoogleAuthProvider());
  // This gives you a Google Access Token. You can use it to access the Google API.
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  // The signed-in user info.
  const user = result.user;
  // IdP data available using getAdditionalUserInfo(result)
  // ...
  // 
  insertAccount(userObj(user, 'google'));
  return {uid: user.uid, name: user.displayName};
  // Handle Errors here.
  // const errorCode = error.code;
  // const errorMessage = error.message;
  // The email of the user's account used.
  // const email = error.customData.email;
  // The AuthCredential type that was used.
  // const credential = GoogleAuthProvider.credentialFromError(error);
  // ...
}

function signInAnon() {
  signInAnonymously(auth)
    .then(() => {
      // signed in...
    })
    .catch((error) => {
      console.error(error);
    });
}

function getRedirectSignInResult(provider) {
  getRedirectResult(auth)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = provider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = provider.credentialFromError(error);
      // ...
    });
}

async function signOutUser() {
  try {
    signOut(auth);
  } catch (error) {
    console.error(error);
    return false;
  }
  // Sign-out successful.
  return true;
}

function sendPasswordReset(email) {
  sendPasswordResetEmail(auth, email)
    .then((_) => {
      alert("Password reset link sent!");
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
}

function defaultPreferences() {
  return ({
    includeFastFood: true,
    includeHistory: true,
    minimumRating: 1,
    requireFamilyFriendly: false
  });
}

function defaultHistory() {
  return ({
    dateAdded: Timestamp.now(),
    rating: 0,
    restaurant: 'placeholder'
  });
}

function getGroupInfo(groupID) {
  let docRef = db.collection("groups").doc(groupID).get();
  // const data = docRef.data;
  // data.id = groupID;
  // return data;
  const jsonData = {
    keywords: docRef.keywords,// 1 string
    time: docRef.time,        // Same as db
    price: docRef.price,      // list of prices (integers)
    diet: docRef.diet,        // Same as db (all restrictions, 
    //                            and values are strings)
    // {'halal': 'halal'} true
    // {'halal': ''} false
    latlong: docRef.latlong,  // see what we did before {lat: x, long: x}
  }
  return jsonData
}

async function getGroup(groupId) {
  return await getDocument(doc(db, 'groups', String(groupId)));
}

async function groupExists(groupId) {
  const docRef = await getDoc(doc(db, 'groups', String(groupId)));
  return docRef.exists();
}

async function rateRestaurant(restObject, restRating, user) {
  let text1 = "users";
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

async function deleteHistoryItem(user, hisotryDoc) {
  let usrHis = "users/" + user + "/history/";

  const location = doc(db, `users/${user}/history/${hisotryDoc.id}`);
  // console.log(hisotryDoc.id);
  // console.log(location);
  deleteDoc(location);
}

function deleteUser() {
  const user = auth.currentUser;
  try {
    const uid = user.uid;
    user.delete();
    deleteDoc(doc(db, 'users', uid));
    return true;
  } catch (error) {
    console.log(error);
    alert("You must log in again before you can delete the account.");
    return false;
  }
}

async function getHistory(user) {
  // const user = cookies.get("Name") || "";
  const historyCol = collection(db, 'users/' + user + '/history');
  const historySnapshot = await getDocs(historyCol);
  // const histList = historySnapshot.docs.map(doc => doc.data());
  let historyList = [];
  for (const hist of historySnapshot.docs) {
    let histor = hist.data();
    histor.id = hist.id;
    // console.log("Hist id in getHistory");
    // console.log(hist.id);
    historyList.push(histor);
  }
  // console.log("historyList");
  // console.log(historyList);
  historyList = historyList.filter((elem) => {
    if (elem.restaurant !== 'placeholder') {
      return elem;
    }
  });
  return historyList;
}

async function getImagesForBusiness(business_id) {
  const photosRef = ref(storage, `photos/${business_id}`);
  const resp = await listAll(photosRef);
  return resp.items
}

async function getImageURLsForBusiness(business_id) {
  const items = await getImagesForBusiness(business_id);
  const downloadUrls = [];
  for (const itemRef of items) {
    try {
      const url = await getDownloadURL(itemRef);
      downloadUrls.push(url);
    } catch (error) {
      console.log(error);
    }
  }
  return downloadUrls;
}

async function historyItem(historyDoc) {
  const retVal =
  {
    date: historyDoc.getString("dateAdded"),
    rating: historyDoc.getString("rating"),
    restaurant: historyDoc.getString("restaurant")
  }
  return retVal;
}


async function getFilters(user) {
  const userCol = collection(db, 'users');
  const que = await getDoc(doc(db, 'users', user));

  return que.data();
}

async function setPreferences(user, FamVal, HisVal, FastFoodVal, rating) {
  updateDoc(doc(db, 'users', user), {
    'filters.preferences.includeFastFood': FastFoodVal,
    'filters.preferences.includeHistory': HisVal,
    'filters.preferences.requireFamilyFriendly': FamVal,
    'filters.preferences.minimumRating': rating
  })
}

/**
 * TODO: Finish. See firebase docs.
 */
async function changePassword(newPassword) {
  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (err) {
    return Promise.reject(err.message);
  }
}

async function getDietRest() {
  const diet = await getDoc(doc(db, 'preferenceFields', 'allFields'));

  return diet.data();
}

async function updateDietRestrictions(user, listOfRestrictions) {
  updateDoc(doc(db, 'users', user), {
    'filters.dietaryRestrictions': listOfRestrictions
  })
}

async function getCuisines() {
  const cuisineCol = collection(db, 'cuisines');
  const cuiSnapshot = await getDocs(cuisineCol);

  let cuisineList = [];
  for (const cui of cuiSnapshot.docs) {
    let cuis = cui.data();
    cuis.id = cui.id;
    cuisineList.push(cuis);
  }
  return cuisineList;
}

async function updateUserCuisine(user, listOfCuisine) {
  updateDoc(doc(db, 'users', user), {
    'filters.excludedCuisines': listOfCuisine
  })
}

/**
 * Returns a unique code for a group.
 * @param {int} length Number of values in the code
 * @param {int} max The maximum value for each digit
 * @param {int} min The minimum value for each digit
 * @returns A code with 'length' values each in the range [min, max) (if max > 10, 
 * there may be more than 'length' digits in the code if a value is itself multiple digits)
 */
async function getCode(length = 6, max = 10, min = 0) {
  let id = '';
  // low collision rate, this should be fine
  let numDupCodes = 1;
  do {
    for (let i = 0; i < length; ++i) {
      id += `${Math.floor(Math.random() * max) + min}`;
    }
    numDupCodes = (await getCountFromServer(query(collection(db, 'groups'), where('code', '==', id)))).data().count;
  } while (numDupCodes !== 0);
  return id;
}

// Define function that creates a group and gives the user a code they can share for others to join.
// This may as well be the ID of the group in Firestore.
async function createGroup(code) {
  const groupRef = doc(db, 'groups', code);

  if (getDoc(groupRef).exists) return null;

  await setDoc(groupRef, defaultGroup(code, getAuth().currentUser));
  return (await getDocument(groupRef));
}

// What about anon users?
function defaultGroup(code, currentUser) {
  const dataObj = defaultGroupUserData(currentUser);

  const data = {};
  data[currentUser.uid] = dataObj;

  return ({
    host: currentUser.uid,
    users: [
      currentUser.uid
    ],
    latlong: { latitude: 0, longitude: 0, distance: 0 },
    numUsers: 1,
    numUsersReady: 0,
    groupCode: code,
    data: data
  });
}

function defaultGroupUserData(currentUser) {
  const dids = {
    "Halal": '',
    "Gluten-free": '',
    "Dairy-free": '',
    "Vegan": '',
    "Kosher": '',
    "Soy-free": '',
    "Vegetarian": '',
  }
  const uf = currentUser.filters;
  const dr = (uf && uf.dietaryRestrictions) || [];

  for (const k of dr) dids[k] = k;
  return {
    diet: dids,
    price: [1],
    keywords: '',
  }
}

async function joinGroup(code, user) {
  if (!(await groupExists(code))) {
    console.log("Group doesn't exist.");
    return null;
  }

  return await updateGroupMember(code, 'users', user.uid);
}

/**
 * 
 * @param {string} code The code to the group to update.
 * @param {*} user The firebase auth object
 * @param {string} key The key in the group doc to update.
 * @param {*} value The value to add to the group's `key`. Value is not used if updating users.
 * @returns 
 */
async function updateGroupMember(code, key, value) {
  if(!(await groupExists(code))) {
    console.log("Group doesn't exist.");
    return false;
  }
  const user = getAuth().currentUser;
  const groupDocRef = doc(db, 'groups', code);
  const groupDoc = (await getDoc(groupDocRef)).data();
  const userData = groupDoc['data'][user.uid];
  switch(key) {
    case 'users':
      if (groupDoc.users.includes(value)) {
        console.log("Already in group");
        return true;
      }
      // console.log(groupDoc[key]);
      groupDoc[key] = groupDoc[key].concat(value);
      groupDoc['numUsers'] = groupDoc[key].length;
      groupDoc['data'][user.uid] = defaultGroupUserData(user);
      break;
    case 'keywords':
    case 'price':
    case 'diet':
      userData[key] = value;
      break;
    default:
      console.log(`Invalid update key: ${key}`);
      return false
  }
  console.log(groupDoc);
  try {
    updateDoc(groupDocRef, groupDoc);
    return true;
  } catch (e) {
    console.log("Failed to join group, see below reason:");
    console.error(e);
    return false;
  }
}

async function updateGroupHost(code, key, value) {
  console.log(value);
  if (!(await isHost(code, getAuth().currentUser))) {
    console.error("Not the group's host!");
    return false;
  }

  if (supportedMemberGroupKeys.includes(key)) {
    return updateGroupMember(code, key, value);
  }

  const groupDocRef = doc(db, 'groups', code);
  const groupDoc = (await getDoc(groupDocRef)).data();

  switch(key) {
    case 'latlong':
    case 'time':
      groupDoc[key] = value;
      break;
    default:
      console.error(`Invalid update key: ${key}`);
      return false;
  }
  console.log(key);
  console.log(groupDoc);

  try {
    await updateDoc(groupDocRef, groupDoc);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function isHost(code, user) {
  const groupSnap = await getDoc(doc(db, 'groups', code));
  return groupSnap.data().host === user.uid;
}

export { db, analytics, signInWithGoogle, isHost, updateGroupHost, updateGroupMember, joinGroup, groupExists, getCode, createGroup, getGroup, getDocument, getGroupInfo, getCuisines, updateUserCuisine, updateDietRestrictions, getDietRest, getRestaurantBy, changePassword, deleteUser, sendPasswordReset, signOutUser, getRedirectSignInResult, signInAnon, signInWithGoogleMobile, signInEmailPassword, createUserEmailPassword, deleteHistoryItem, getImagesForBusiness, getImageURLsForBusiness, getRestaurantById, getRestaurant, getAllRestaurants, getAllAccounts, getAccount, emailOrUsernameUsed, rateRestaurant, getHistory, validateUser, historyItem, getFilters, setPreferences }
