import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccounts, getHistory, getAllAccounts, getRestaurantBy, getAccount, getRestaurant } from './firestore';
// import { rateRestaurant } from './firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import Account from './components/Accounts';
import { Routes, Route, useLocation } from 'react-router-dom'
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
import Preferences from'./components/Preferences';
import Allergies from './components/Allergies';
import Cuisine from './components/PresetCuisines';
import HomePage from './components/HomePage';
import ExpandRadius from './components/ExpandRadiusPage';
import { useState, useMemo } from 'react';

library.add(faMoon, faRocket, faStar, faStarHalf, faCopy);

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function App() {
  const [cookies, setCookie] = useCookies(['user'])
  let userWithHistory = getAccount("username", "admin");
  const [state, setState] = useState({});
  // const restaurant = {name: "Fake Restaurant!", location: {streetAddress: "4903 State Rd 54", state: "FL", city: "New Port Richey", postalCode: '16127', latitude: 28.2172884, longitude: -82.7333444}};
  
  // To get query parameters, use the line below and use the parameters name instead of paramName
  // query.get('paramName');
  let query = useQuery();

  return (
    <div>
      <Routes>
        <Route path="/recommendations" element={<Recommendations recommendationIds={cookies["businesslist"]} setState={setState} indexNum = {0}/>} />
        <Route path="/recommendations/map" element={<RecommendationMap business_id={query.get('business_id')} state={state}/>}/>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History />} />
        <Route path="/search" element={<Search />}/>
        <Route path="/historySearch" element={<HistorySearch />}/>
        <Route path="/displayTest"element={<DisplayTest/>}/>
        <Route path="/keywordGrab"element={<KeywordGrab/>}/>
        <Route path="/priceCheck"element={<PriceGrab/>}/>
        <Route path="/timeGrab"element={<TimeGrab/>}/>
        <Route path="/dietaryRestrictions"element={<DietCheck/>}/>
        <Route path="/location"element={<DistanceGrab/>}/>
        <Route path="/account/filters" element={<Preferences />}/>
        <Route path="/account/allergies" element={<Allergies />}/>
        <Route path='/selectCuisine' element={<Cuisine />} />
        <Route path='/expandRadius' element={<ExpandRadius />} />
      </Routes>
    </div>
  )
}

export default App;
