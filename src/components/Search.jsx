import { useEffect, useState } from "react";
import { getHistory, rateRestaurant, getAllRestaurants } from "../firestore";
import { Navigate, useNavigate } from 'react-router-dom';
import { BackButton } from "./Buttons";


export default function SearchPrint({ user }) {
    const [restaurants, setRes] = useState([]);
    // const [user, setUser] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState("")

    useEffect(() => {
        async function getPath() {
            const path = await getAllRestaurants();
            setRes(path);
        }
        getPath();
    }, []);


    // const auth = getAuth();
    // useEffect(() => {
    //   onAuthStateChanged(auth, (user) => {
    //     if(!user.isAnonymous) {
    //         setUser(user);
    //     } else {
    //         setUser(null);
    //     }
    //   });
    // });

    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

    return (
        <div>
            <BackButton to='/history' />
            <div style={{ 'padding-top': '100px' }}>
                Restaurants
                {restaurants.map(restaurant => (
                    <div key={restaurant.business_id}>
                        <p>Restaurant: {restaurant.name}</p>
                        <p>Stars: {restaurant.stars}</p>
                        {<div>
                            <button onClick={() => rateRestaurant(restaurant, 1, user.uid || "")}>ThumbsUp</button>
                            <button onClick={() => rateRestaurant(restaurant, -1, user.uid || "")}>ThumbsDown</button>
                        </div>}
                    </div>
                ))}

            </div>
        </div>
    );
}