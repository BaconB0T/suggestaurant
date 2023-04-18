import { useEffect, useState } from "react";
import { getHistory, rateRestaurant, getAllRestaurants } from "../firestore";
import { Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { BackButton, HomeButton } from "./Buttons";
import '../styles/add-history.css'


export default function SearchPrint({ user }) {
    const [restaurants, setRes] = useState([]);
    // const [user, setUser] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function getPath() {
            const path = await getAllRestaurants();
            setRes(path);
        }
        getPath();
    }, []);

    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

    const handleLikeClick = res => {
        rateRestaurant(res, 1, user.uid || "");
        document.getElementById(res.name + 'liked').className = 'fas fa-sm';
        document.getElementById(res.name + 'disliked').className = 'far fa-sm';
    };

    const handleDislikeClick = res => {
        rateRestaurant(res, -1, user.uid || "");
        document.getElementById(res.name + 'liked').className = 'far fa-sm';
        document.getElementById(res.name + 'disliked').className = 'fas fa-sm';
    };

    return (
        <Container
        className="d-flex align-items-center justify-content-center overflow-auto"
        style={{ minHeight: "100vh" }}
        >
            <BackButton to='/history' />
            <HomeButton />
            <head>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.13.0/css/all.css" />
            </head>
            <div id='restaurant-container'>
                <h3>Restaurants</h3>
                <div>
                    {restaurants.map(restaurant => (
                        <div id= {restaurant.name + 'rest-elem'} className = 'rest-elem' key={restaurant.business_id}>
                            <div>Restaurant: {restaurant.name}</div>
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
                            <div>Rate this Restaurant:</div>
                            <div id = 'button-container'>
                                <button id = 'liked' onClick={() => handleLikeClick(restaurant)}><i id = {restaurant.name + 'liked'} className="far fa-sm">&#xf164;</i></button>
                                <button id = 'disliked' onClick={() => handleDislikeClick(restaurant)}><i id = {restaurant.name + 'disliked'} className="far fa-sm">&#xf165;</i></button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </Container>
    );
}