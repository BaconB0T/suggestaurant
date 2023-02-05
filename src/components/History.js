
import {useEffect, useState} from "react";
import { getHistory, rateRestaurant, getRestaurant, deleteHistoryItem} from "../firestore";
import { useCookies } from 'react-cookie';

function HistoryElem(props) {
  const [restaurant, setRestaurant] = useState([]);
  const[cookies, setCookie,removeCookie] = useCookies(['id']);
  // get restaurant
  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurant(props.history.restaurant);
      setRestaurant(rest);
    }
    setRes();
  }, []);


  const handleClick = event =>{
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

function History() {
  const [cookies] = useCookies(['id']);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    async function cried() {
      const usersHistory = await getHistory(cookies.id);
      setHistory(usersHistory);
    }
    cried();
  }, []);

  const historyComponents = [];
  for (const historyItem of history) {
    // if(historyItem.restaurant !== "placeholder") {
    //   console.log(historyItem);
      historyComponents.push(<HistoryElem key={historyItem.restaurant} history={historyItem} />);
    // }
  }

  return(
    <div>
      <h1>History</h1>
      <ol id="history-list">{historyComponents}</ol>
    </div>
  )
}

export default History;
