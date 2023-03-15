import { useEffect, useState } from "react";
import { getHistory, rateRestaurant, getRestaurant, deleteHistoryItem } from "../firestore";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';

function HistoryElem(props) {
  const [restaurant, setRestaurant] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['id']);
  // get restaurant
  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurant(props.history.restaurant);
      setRestaurant(rest);
    }
    setRes();
  }, []);


  const handleClick = event => {
    deleteHistoryItem(cookies.id, restaurant);
    event.currentTarget.disabled = true;
    // console.log("Button Pressed");
  };

  return (
    <li>
      Name: {restaurant.name}<br></br>
      Stars: {restaurant.stars}<br></br>
      Your Rating: {props.history.rating}<br></br>
      <button onClick={handleClick}>X</button>
    </li>
  );
}

function History({user}) {
  const [cookies] = useCookies(['id']);
  const [history, setHistory] = useState([]);

  // const [user, setUser] = useState([]);

  // const auth = getAuth();

  useEffect(() => {
    if (user && !user.isAnonymous) {
      getHistory(user.uid).then((usersHistory) => {
        setHistory(usersHistory);
        console.log(usersHistory);
        console.log(user.uid);
      });
    }
  }, []);

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (!user.isAnonymous) {
  //       setUser(user);
  //       getHistory(user.uid).then((usersHistory) => {
  //         setHistory(usersHistory);
  //         console.log(usersHistory);
  //         console.log(user.uid);
  //       });
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/firebase.User
  //     } else {
  //       // User is signed out
  //       setUser(null);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   async function cried() {

  //   }
  //   cried();
  // }, []);

  // redirect on anonymous user
  if (user === null || user.isAnonymous) {
    return (
      <Navigate to='/login' />
    );
  }

  const historyComponents = [];
  for (const historyItem of history) {
    // if(historyItem.restaurant !== "placeholder") {
    // console.log(historyItem);
    historyComponents.push(<HistoryElem key={historyItem.id} history={historyItem} />);
    // }
  }

  return (
    <div>
      <h1>History</h1>
      <div>
        <h4>Add To History</h4>
        <button><Link to='/search'>Select Restaurants</Link></button>
      </div>
      <ol id="history-list">{historyComponents}</ol>
    </div>
  )
}

export default History;
