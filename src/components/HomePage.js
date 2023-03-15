import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Popup from './Popup';
import './PopupStyling.css';
import {getAuth} from "firebase/auth";
import {getLastVisitedRestaurant, rateRestaurant, setLastVisitedRestaurant} from "../firestore.js";

const HomePage = () => {
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [loginOrAccount, setLoginOrAccount] = useState("Login")

    // const [isOpen, setIsOpen] = useState(false);
    const [lastVisitedRestaurant, setStateLastVisitedRestaurant] = useState(null);

    // const togglePopup = () => {
    //     setIsOpen(!isOpen);
    // }



    async function handleClickQuiz() {
        try {
            setCookie('groupCode', 0, { path: '/' });
            setCookie('host', false, { path: '/' });
            navigate("/location");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickQuiz2() {
        try {
            setCookie('host', true, { path: '/' });
            navigate("/group/host");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickQuiz3() {
        try {
            setCookie('host', false, { path: '/' });
            navigate("/group/join");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickLogin() {
        try {
            navigate("/login");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

  
    const user = getAuth().currentUser;
    if(user && user.uid){
        Promise.resolve(getLastVisitedRestaurant(user.uid)).then(result => {
            setStateLastVisitedRestaurant(result);
        });
    };

    const addRestToHistory = (rating_num) => {
        console.log("ADD REST TO HISTORY")
        const user = getAuth().currentUser;
        rateRestaurant(lastVisitedRestaurant, rating_num, user.uid);
        setLastVisitedRestaurant(user.uid, null)        
        
    };

    const closePopup = () => {
        console.log("CLOSE POPUP")
        const user = getAuth().currentUser;
        setLastVisitedRestaurant(user.uid, null)
    };

    

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>


                <div>
                                        
                    {lastVisitedRestaurant && <Popup
                        content={<>
                            <b>How was { lastVisitedRestaurant ? lastVisitedRestaurant.name : "YOU SHOULD NEVER SEE THIS" }?</b>
                            <br></br>
                            <br></br>
                            <button onClick={()=>addRestToHistory(1)}>👍</button>  <button onClick={()=>addRestToHistory(-1)}>👎</button>

                        </>}
                        handleClose={closePopup}
                    />}
                </div>

                <>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Suggestaurant</h2>
                            <Button onClick={() => handleClickQuiz()}>
                                Start Quiz
                            </Button>
                            <br></br>
                            <br></br>
                            <Button onClick={() => handleClickLogin()}>
                                {loginOrAccount}
                            </Button>
                            <br></br>
                            <br></br>
                            <Button onClick={() => handleClickQuiz2()}>
                                Host Group Quiz
                            </Button>
                            <br></br>
                            <br></br>
                            <Button onClick={() => handleClickQuiz3()}>
                                Join Group Quiz
                            </Button>
                        </Card.Body>
                    </Card>
                </>

            </div>
        </Container >
    )
}

export default HomePage;