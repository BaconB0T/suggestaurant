import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccounts, getHistory, getAllAccounts, getAccount } from './firestore';
// import { rateRestaurant } from './firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import Accounts from './components/Accounts';
import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import History from './components/History';
import Search from './components/Search';
import HistorySearch from './components/HistorySearch'
import Recommendations from './components/Recommendations'
import Signup from './components/Signup'

function App() {
  let userWithHistory = getAccount("username", "admin");
  return (
    <div>
      <Routes>
        <Route path="/recommendations" element={<Recommendations recommendationIds={[1]}/>} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History />} />
        <Route path="/search" element={<Search />}/>
        <Route path="/historySearch" element={<HistorySearch />}/>
      </Routes>
    </div>
  )
}

export default App;
