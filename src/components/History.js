import { useEffect, useState, useRef } from "react";
import { getHistory, getRestaurant, deleteHistoryItem } from "../firestore";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';
import '../styles/History.css';
import { Container } from "react-bootstrap";
import { BackButton, HomeButton } from "./Buttons";


function HistoryElem(props) {
  const [restaurant, setRestaurant] = useState([]);
  const [loc, setLocation] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['id']);


  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurant(props.history.restaurant);
      setRestaurant(rest);
      setLocation(rest.location);
    }
    setRes();
  }, []);


  const handleClick = event => {
    deleteHistoryItem(props.user.uid, restaurant);
    // event.currentTarget.disabled = true;
    document.getElementById(restaurant.name + 'button background').remove();
  };

 
  

  return (
    // <Container
    // className="d-flex align-items-center justify-content-center overflow-auto"
    // style={{ minHeight: "100vh" }}
    // >
    <div>
      <head>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.13.0/css/all.css" />
      </head>
      <div className='button-test' id={restaurant.name + 'button background'}>
        <a class='button' id = {restaurant.name + 'button'} className='rest-but' href={'#' + restaurant.name}>  
          <div id='rest-title' >{restaurant.name}</div>
          {/* <li className="res-element"> */}
              <div id="stars">
                {[...Array(5)].map((star, index) => {
                  index += 1;
                  return (
                    <div key={index} className={index <= (restaurant.stars) ? 'light-on' : 'light-off'}>
                      <span className="st">&#9733;</span>
                    </div>
                  )
                })}
              </div>
              <div>Your Rating: </div>
                {(props.history.rating === 1) ? <i id='liked' class="fas fa-sm">&#xf164;</i> : <i id='disliked' class="fas fa-sm">&#xf165;</i>}
          {/* </li> */}
        </a>
        <button id={restaurant.name + 'trash-button'} className='trash-button' onClick={handleClick}><i class="far">&#xf2ed;</i></button>
        
      </div>

      {/* Restaurant Popup Card Information  */}
      <div id={restaurant.name} class='overlay' href='javascript:history.back()'>
        <div class='popup' id = 'restaurant popup' onClick={() => console.log('clicked')}>
          <a class="close" href='javascript:history.back()'>&times;</a>
          <div class="content" className='rest-content'>
            <div className='pop-up-title'>{restaurant.name}</div>
            <div >{loc.streetAddress + ', ' + loc.city + ', ' + loc.state}</div>
            <div >Your Rating: {(props.history.rating === 1) ? <i id='pop-up-liked' class="fa">&#xf164;</i> : <i id='pop-up-disliked' class="fa">&#xf165;</i>}</div>
            <div id="stars" style={{ justifyContent: 'center' }}>
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <div key={index} className={index <= (restaurant.stars) ? 'light-on' : 'light-off'}>
                    <span className="st">&#9733;</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

    </div>

  );
}

function History({ user }) {
  const [cookies] = useCookies(['id']);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user.isAnonymous) {
      getHistory(user.uid).then((usersHistory) => {
        setHistory(usersHistory);
        console.log(usersHistory);
        console.log(user.uid);
      });
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
    }
  }, []);

  const navigate = useNavigate();
  const [error, setError] = useState("")

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
    historyComponents.push(<HistoryElem user={user} key={historyItem.id} history={historyItem} />);
    // }
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center overflow-auto"
      style={{ minHeight: "100vh" }}
    >
      <BackButton to='/account' />
      <HomeButton />
      <div id = "hist-cont">
        <h3>History</h3>
        <div>
          <h4>Add To History</h4>
          <button><Link to='/search'>Select Restaurants</Link></button>
        </div>
        <ol id="history-list">{historyComponents}</ol>
      </div>
    </Container>
  )
}

export default History;
