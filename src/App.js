import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc } from 'firebase/firestore';
import { doc, setDoc, Timestamp } from "firebase/firestore"; 
import { getAccounts, getHistory} from './firestore';
// import { rateRestaurant } from './firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import HelloWorld from './components/HelloWorld';
import Header from './components/Header';
import Accounts from './components/Accounts';

function App() {
  let accounts = getAccounts();
  return (
    <div>
      {/* <Header />
      <HelloWorld name="Ninja" lname="Monkey"/> */}
      <Accounts accounts={accounts}/>
    </div>
  )
}

// skeleton project
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

getHistory().then((history) => console.log(history))

export default App;
