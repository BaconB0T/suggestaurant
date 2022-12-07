import { onSnapshot, collection, doc,  getDocs } from "firebase/firestore";
import {useEffect, useState} from "react";
import {db, getHistory, rateRestaurant, getAllRestaurants} from "../firestore";
import { useCookies } from 'react-cookie';


export default function SearchPrint(){
    const [restaurants, setRes] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies(['id']);

    useEffect(() => {
        async function getPath(){
            const path = await getAllRestaurants();
            setRes(path);
        }
        getPath();
    }, []);

    return (
        <div>
            Restaurants
            {restaurants.map(restaurant => ( 
                <div>
                    <p>Restaurant: {restaurant.name}</p>
                    <p>Stars: {restaurant.stars}</p>
                    {<div>
                        <button onClick={rateRestaurant(restaurant.name, 1, cookies.id || "")}>ThumbsUp</button>
                        <button onClick={rateRestaurant(restaurant.name, 0, cookies.id || "")}>ThumbsDown</button>
                    </div>}
                </div>
            ))}

        </div>
    );
}