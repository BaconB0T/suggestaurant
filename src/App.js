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
import PriceGrab from './components/priceCheck';
import TimeGrab from './components/timeGrab';
import DietCheck from './components/dietCheck';
import DistanceGrab from './components/distanceGrab';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMoon, faRocket, faStar, faStarHalf, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCookies } from 'react-cookie';

library.add(faMoon, faRocket, faStar, faStarHalf, faCopy);

function App() {
  const [cookies, setCookie] = useCookies(['user']);
  let userWithHistory = getAccount("username", "admin");
  const restaurant = {name: "Fake Restaurant!", location: {streetAddress: "4903 State Rd 54", state: "FL", city: "New Port Richey", postalCode: '16127', latitude: 28.2172884, longitude: -82.7333444}};
  return (
    <div>
      <Routes>
        <Route path="/recommendations" element={<Recommendations recommendationIds={cookies["businesslist"]} indexNum = {0}/>} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History />} />
        <Route path="/search" element={<Search />}/>
        <Route path="/historySearch" element={<HistorySearch />}/>
        <Route path="/recommendation/map" element={<RecommendationMap res={restaurant}/>}/>
        <Route path="/displayTest"element={<DisplayTest/>}/>
        <Route path="/keywordGrab"element={<KeywordGrab/>}/>
        <Route path="/priceCheck"element={<PriceGrab/>}/>
        <Route path="/timeGrab"element={<TimeGrab/>}/>
        <Route path="/dietaryRestrictions"element={<DietCheck/>}/>
        <Route path="/location"element={<DistanceGrab/>}/>
      </Routes>
    </div>
  )
}

export default App;
