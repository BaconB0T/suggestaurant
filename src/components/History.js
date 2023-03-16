import { useEffect, useState } from "react";
import { getHistory, rateRestaurant, getRestaurant, deleteHistoryItem } from "../firestore";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useNavigate, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styles/History.css';
import { Container  } from "react-bootstrap";

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
    event.currentTarget.disabled = true;
    // console.log("Button Pressed");
  };

  return (
    // <Container
    // className="d-flex align-items-center justify-content-center overflow-auto"
    // style={{ minHeight: "100vh" }}
    // >
    <div>
      <head>
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.13.0/css/all.css"/>
      </head>
      <div className='button-test'>
        <a class='button' className = 'rest-but' href={'#' + restaurant.name}>
          <li className="res-element">
              <div id = 'rest-title' >{restaurant.name}</div>
              <div className= 'spacing'/>
                <div id="test">
                  {[...Array(5)].map((star, index) => {
                    index +=1;
                    return (
                      <div key = {index} className= {index <= (restaurant.stars) ? 'light-on' : 'light-off'}>
                        <span className="st">&#9733;</span>
                      </div>
                    )
                  })}
                </div>
              <div className= 'spacing' id={(props.history.rating === 1) ? 'liked' : 'disliked'}/> 
              Your Rating: {(props.history.rating === 1) ? <i id='liked' class="fas fa-sm">&#xf164;</i> : <i id='disliked' class="fas fa-sm">&#xf165;</i>}
              {/* <div className= 'spacing'/> <button id = 'trash-button' onClick={handleClick}><i class="far">&#xf2ed;</i></button> */}
            
          </li>
        </a>
        <div className= 'spacing'/> <button id = 'trash-button' onClick={handleClick}><i class="far">&#xf2ed;</i></button>
            
      </div>

    {/* Restaurant Popup Card Information  */}
    <div id={restaurant.name} class='overlay'>
      <div class = 'popup'>
        <a className = 'pop-up-title'>{restaurant.name}</a>
        <a class="close" href='javascript:history.back()'>&times;</a>
        <div class="content" className = 'rest-content'>
          <div >{loc.streetAddress + ', ' +  loc.city + ', ' + loc.state}</div>
          <div >Your Rating: {(props.history.rating === 1) ? <i id='liked' class="fa">&#xf164;</i> : <i id='disliked' class="fa">&#xf165;</i>}</div>
          <div id="test" style={{ justifyContent: 'center' }}>
            {[...Array(5)].map((star, index) => {
              index +=1;
              return (
                <div key = {index} className= {index <= (restaurant.stars) ? 'light-on' : 'light-off'}>
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

function History({user}) {
  const [cookies] = useCookies(['id']);
  const [history, setHistory] = useState([]);

  // const [user, setUser] = useState([]);

  // const auth = getAuth();

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
    historyComponents.push(<HistoryElem user = {user} key={historyItem.id} history={historyItem} />);
    // }
  }

  return (
    <Container
    className="d-flex align-items-center justify-content-center overflow-auto"
    style={{ minHeight: "100vh" }}
    >
    <div>
    
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
