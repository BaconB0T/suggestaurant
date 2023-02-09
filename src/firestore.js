import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, signInAnonymously, sendPasswordResetEmail } from "firebase/auth"
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, getDocs, getDoc, Timestamp, doc, setDoc, deleteDoc, query, where, limit, onSnapshot } from "firebase/firestore";

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

async function getRestaurantBy(field, value) {
  // if(!['business_id', 'isOpen'].includes(field)) {
  //   throw new Error("Field must be one of username, email, or uid.");
  // }
  const restCol = collection(db, 'restaurants');
  const q = query(restCol, where(`${field}`, '==', `${value}`));
  
  const querySnapshot = await getDocs(q);
  // const docs = querySnapshot.docs.map((doc) => doc.data());
  
  let docs = querySnapshot.docs;
  if(docs.length === 0) {
    return null;
  } else {
    let docsData = docs.map((doc) => doc.data());
    for(let i = 0; i < docsData.length; ++i) {
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
  if(!['username', 'email', 'uid'].includes(field)) {
    throw new Error("Field must be one of username, email, or uid.");
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
    doc.uid = docs[0].uid;
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
    insertAccount({
      uid: user.uid,
      email: email,
      username: username,
      // No need for password, firesbase handles that for us.
      authProvider: "local",
      filters: {
        dietaryRestrictions: [],
        excludedCuisines: [],
        preferences: defaultPreferences(),
      },
    });
    return {uid: user.uid, name: username};
  } catch(error) {
    console.error(error);
    alert(error.message);
    // string: auth/specific-reason
    return null;
  }
}
  

async function signInEmailPassword(email, password) {
  try {
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    return {bool: true, idOrCode: userCreds.user.uid};
  } catch (error) {
    console.error(error);
    alert(error.message);
    return {bool: false, idOrCode: error.code};
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
        if(docs.docs.length === 0) {
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
      alert(error.message)
      // const email = error.customData.email;
      // const credential = googleProvider.credentialFromError(error);
    });
}

// idek if this works (or signInWithProviderPopup).
function signInWithProviderRedirect(provider) {
  signInWithRedirect(auth, provider);
}

function signInAnon() {
  signInAnonymously(auth)
    .then(() => {
      // signed in...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(`Error: ${errorCode}: ${errorMessage}`);
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
    alert(error.message);
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

function deleteUser() {
  const user = auth.currentUser;
  try {
    const uid = user.uid;
    user.delete();
    deleteDoc(doc(db, 'users', uid));
    return true;
  } catch(error) {
    console.log(error);
    alert("You must log in again before you can delete the account.");
    return false;
  }
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

async function getImagesForBusiness(business_id) {
  
  const photosRef = ref(storage, `photos/${business_id}`);
  const resp = await listAll(photosRef);
  return resp.items
}

async function getImageURLsForBusiness(business_id) {
  const items = await getImagesForBusiness(business_id)
  const downloadUrls=[]
  items.forEach((itemRef) => {
    getDownloadURL(itemRef).then((url) => {
      downloadUrls.push(url)
    })
  });
  return downloadUrls
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

/**
 * TODO: Finish. See firebase docs.
 */
function changePassword(newPassword) {
  return true
}

export { db, analytics, auth, getRestaurantBy, changePassword, deleteUser, sendPasswordReset, signOutUser, getRedirectSignInResult, signInAnon, signInWithProviderRedirect, signInWithGoogleMobile, signInEmailPassword, createUserEmailPassword, deleteHistoryItem, getImagesForBusiness, getImageURLsForBusiness, getRestaurantById, getRestaurant, getAllRestaurants, getAllAccounts, getAccount, emailOrUsernameUsed, rateRestaurant, getHistory, validateUser, historyItem }
