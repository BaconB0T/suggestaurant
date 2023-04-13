import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { getAccount, getRestaurantById, signInAnon } from './firestore';
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
import Preferences from './components/Preferences';
import Allergies from './components/Allergies';
import Cuisine from './components/PresetCuisines';
import HomePage from './components/HomePage';
import ExpandRadius from './components/ExpandRadiusPage';
import Group from './components/Group';
import GroupWaiting from './components/GroupWaiting';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useMemo, useEffect } from 'react';
import { BsGearFill } from "react-icons/bs";
import WaitingForRecommendation from './components/WaitingForRecommendation';
import UserWaiting from './components/UserWaiting';
import ChangeLocation from './components/changeLocation';


library.add(faMoon, faRocket, faStar, faStarHalf, faCopy, BsGearFill);

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function App() {
  const [cookies, setCookie] = useCookies(['user'])
  let userWithHistory = getAccount("username", "admin");
  const [state, setState] = useState({});
  const [user, setUser] = useState(null);
  const testRestauarantId = '---kPU91CF4Lq2-WlRu9Lw';

  useEffect(() => {
    onAuthStateChanged(getAuth(), (userObj) => {
      if (userObj === null) {
        signInAnon();
      } else {
        setUser(userObj);
      }
    });
  }, [user]);
  // const restaurant = {name: "Fake Restaurant!", location: {streetAddress: "4903 State Rd 54", state: "FL", city: "New Port Richey", postalCode: '16127', latitude: 28.2172884, longitude: -82.7333444}};
  // To get query parameters, use the line below and use the parameters name instead of paramName
  // query.get('paramName');
  let query = useQuery();

  // null user means we are still initializing.
  if (user === null) return "Loading...";

  return (
    <div className="App">
      <Routes>
        <Route path="/recommendations" element={<Recommendations recommendationIds={state.businesslist || cookies["businesslist"]} setGlobalState={setState} />} />
        {/* <Route path="/recommendations/map" element={<RecommendationMap business_id={testRestauarantId} globalState={state} />} /> */}
        <Route path="/recommendations/map" element={<RecommendationMap business_id={query.get('business_id')} globalState={state} />} />
        <Route path="/" element={<HomePage setGlobalState={setState} globalState={state} bob={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account user={user} />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/search" element={<Search user={user} />} />
        {/* should /historySearch be blocked to anon users? */}
        <Route path="/historySearch" element={<HistorySearch />}/>
        <Route path="/displayTest"element={<DisplayTest/>}/>
        <Route path="/keywordGrab"element={<KeywordGrab setGlobalState={setState} user = {user}/>}/>
        <Route path="/priceCheck"element={<PriceGrab globalState={state} setGlobalState={setState}/>}/>
        <Route path="/timeGrab"element={<TimeGrab/>}/>
        <Route path="/dietaryRestrictions"element={<DietCheck user={user} globalState={state} setGlobalState={setState}/>}/>
        <Route path="/location" element={<DistanceGrab user={user} setGlobalState={setState} globalState={state}/>}/>
        <Route path="/account/filters" element={<Preferences user={user} setGlobalState={setState} updated={state.updated} />}/>
        <Route path="/account/allergies" element={<Allergies user={user}/>}/>
        <Route path='/selectCuisine' element={<Cuisine user={user} setGlobalState={setState}/>} />
        <Route path='/expandRadius' element={<ExpandRadius globalState={state}/>} />
        {/* <Route path='/generateCodePage' element={<GetCodePage />}/> */}
        <Route path='/group/join' element={<Group isHost={false} globalState={state} setGlobalState={setState} />} />
        <Route path='/group/host' element={<Group isHost={true} />} />
        <Route path='/group/waiting' element={<GroupWaiting setGlobalState={setState} />} />
        <Route path='/recommendations/waiting' element={<WaitingForRecommendation setGlobalState={setState} />} />
        <Route path='/waiting/' element={<UserWaiting setGlobalState={setState} globalState={state} />} />
        <Route path = '/changeLocation' element = {<ChangeLocation/>}/>
      </Routes>
    </div>
  )
}

export default App;
