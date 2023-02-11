import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccounts, getHistory, getAllAccounts, getRestaurantBy, getAccount, getRestaurant } from './firestore';
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
import ChangePassword from './components/ChangePassword'
import RecommendationMap from './components/RecommendationMap'
import KeywordGrab from './components/KeywordGrab';
import DisplayTest from './components/displayTest';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMoon, faRocket, faStar, faStarHalf } from "@fortawesome/free-solid-svg-icons";

library.add(faMoon, faRocket, faStar, faStarHalf);

function App() {
  let userWithHistory = getAccount("username", "admin");
  const restaurant = {location: {streetAddress: "4903 State Rd 54", state: "FL", city: "New Port Richey", latitude: 28.2172884, longitude: -82.7333444}};
  return (
    <div>
      <Routes>
        <Route path="/recommendations" element={<Recommendations recommendationIds={["---kPU91CF4Lq2-WlRu9Lw"]}/>} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History />} />
        <Route path="/search" element={<Search />}/>
        <Route path="/historySearch" element={<HistorySearch />}/>
        <Route path="/recommendation/map" element={<RecommendationMap loc={restaurant.location} zoomLevel={3}/>}/>
        <Route path="/displayTest"element={<DisplayTest/>}/>
        <Route path="/keywordGrab"element={<KeywordGrab/>}/>
      </Routes>
    </div>
  )
}

export default App;
