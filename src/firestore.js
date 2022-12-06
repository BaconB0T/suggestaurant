import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, Timestamp, doc, setDoc, query, where } from "firebase/firestore";

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
 * 
 * @returns All restaurants in the database.
 */
function getRestaurants() {
  const restaurantsCol = collection(db, 'restaurants');
  const restaurantsSnapshot = getDocs(restaurantsCol);
  const restaurantsList = restaurantsSnapshot.docs.map(doc => doc.data());
  return restaurantsList;
}

/**
 * 
 * @returns All accounts in the database.
 */
async function getAllAccounts() {
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  const usersList = usersSnapshot.docs.map(doc => doc.data());
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
    const usernameCheck = await getAccount("username", doc.account);
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
  const docs = querySnapshot.docs.map((doc) => doc.data());
  if(docs.length === 0) {
    return null;
  } else {
    return docs[0];
  }
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
    restaurant: 'this is just a placeholder'
  });
}

export { db, analytics, getRestaurants, getAllAccounts, getAccount, emailOrUsernameUsed, insertAccount }