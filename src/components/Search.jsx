import {useEffect, useState} from "react";
import { getHistory, rateRestaurant, getAllRestaurants} from "../firestore";
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


export default function SearchPrint(){
    const [restaurants, setRes] = useState([]);
    const [user, setUser] = useState([]);

    useEffect(() => {
        async function getPath(){
            const path = await getAllRestaurants();
            setRes(path);
        }
        getPath();
    }, []);


    const auth = getAuth();
    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if(!user.isAnonymous) {
            setUser(user);
        } else {
            setUser(null);
        }
      });
    });

    if(user === null) {
        return (
            <Navigate to='/login' />
        );
    }

    return (
        <div>
            Restaurants
            {restaurants.map(restaurant => ( 
                <div key = {restaurant.business_id}>
                    <p>Restaurant: {restaurant.name}</p>
                    <p>Stars: {restaurant.stars}</p>
                    {<div>
                        <button onClick={()=>rateRestaurant(restaurant, 1, user.uid || "")}>ThumbsUp</button>
                        <button onClick={()=>rateRestaurant(restaurant, -1, user.uid || "")}>ThumbsDown</button>
                    </div>}
                </div>
            ))}

        </div>
    );
}