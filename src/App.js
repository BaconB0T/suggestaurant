// import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccount, getAllAccounts } from './firestore';
// import { rateRestaurant } from './firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import Accounts from './components/Accounts';

function App() {
  let accounts = getAllAccounts();
  return (
    <div>
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

// rateRestaurant("/restaurants/1", 0);
// getAllAccounts().then((accs) => { console.log(accs); });

// getAccount('username', 'admin');

export default App;
