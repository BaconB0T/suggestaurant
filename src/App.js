// import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccounts, rateRestaurant } from './firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import HelloWorld from './components/HelloWorld';
import Header from './components/Header';
import Accounts from './components/Accounts';

function App() {
  return (
    <div>
      <Header />
      <HelloWorld name="Ninja" lname="Monkey"/>
      {/* <Accounts accounts={getAccounts()}/> */}
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

rateRestaurant("/restaurants/1", 0);

export default App;
