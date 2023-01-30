import {useEffect, useState} from "react";
import { getHistory, rateRestaurant, getRestaurant} from "../firestore";
import { useCookies } from 'react-cookie';

function HistoryElem(props) {
  const [restaurant, setRestaurant] = useState({});
  // get restaurant
  useEffect(() => {
    async function setRes() {
      const rest = await getRestaurant(props.history.restaurant);
      setRestaurant(rest);
    }
    setRes();
  }, {});

  return (
  <li>
    Name: {restaurant.name}<br></br>
    Stars: {restaurant.stars}<br></br>
    Your Rating: {props.history.rating}<br></br>
  </li>
  );
}

function History() {
  const [cookies] = useCookies(['id']);
  const [history, setHistory] = useState([]);

  useEffect(() => {x
    async function cried() {
      const usersHistory = await getHistory(cookies.id);
      setHistory(usersHistory);
    }
    cried();
  }, []);

  const historyComponents = [];
  for (let index = 0; index < history.length; index++) {
    historyComponents.push(<HistoryElem key={history[index].restaurant} history={history[index]} />);
  }

  return(
    <ol id="history-list">{historyComponents}</ol>
  )
}

export default History;