import React, {useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Popup from './Popup';
import './PopupStyling.css';
import {getLastVisitedRestaurant, rateRestaurant, setLastVisitedRestaurant} from "../firestore.js";
import logo from './../images/logo.png'; // Tell webpack this JS file uses this image
import { BsGearFill } from "react-icons/bs";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { RiLoginBoxLine } from "react-icons/ri"




const HomePage = ({bob}) => {
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


    useEffect(() => {
      if (bob.isAnonymous)
      {
        setLoginOrAccount(<RiLoginBoxLine className = "w-20 icon-control login-or-account" onClick={() => handleClickLogin()}/>)
      }
      else
      {
        setLoginOrAccount(<FaRegUserCircle className = "w-20 icon-control login-or-account" onClick={() => handleClickLogin()}/>)
      }
    }, [bob]);


    async function handleClickLogin() {
        try {
            if (!bob.isAnonymous)
            {
                navigate("/login");
            }
            else
            {
                navigate("/account")
            }
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickSettings() {
        try {
            navigate("/login");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

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
  
    if(!bob.isAnonymous && bob.uid){
        Promise.resolve(getLastVisitedRestaurant(bob.uid)).then(result => {
            setStateLastVisitedRestaurant(result);
        });
    };

    const addRestToHistory = (rating_num) => {
        console.log("ADD REST TO HISTORY")
        rateRestaurant(lastVisitedRestaurant, rating_num, bob.uid);
        setLastVisitedRestaurant(bob.uid, null)        
        
    };

    const closePopup = () => {
        console.log("CLOSE POPUP")
        setLastVisitedRestaurant(bob.uid, null)
    };    

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            {loginOrAccount}
            <BsGearFill className = "w-20 icon-control settings" onClick={() => handleClickSettings()}/>
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px"}}>

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
                    {/* <Card className = "card-control">
                        <Card.Body> */}
                            <img src={logo} className="image-control" alt="Logo" />
                            <h2 className="text-center mb-4">Suggestaurant</h2>
                            <Button className = "w-75 button-control" onClick={() => handleClickQuiz()}>
                                Start Quiz
                            </Button>
                            <br></br>
                            <br></br>
                            <Button className = "w-75 button-control" onClick={() => handleClickQuiz2()}>
                                Host Group Quiz
                            </Button>
                            <br></br>
                            <br></br>
                            <Button className = "w-75 button-control" onClick={() => handleClickQuiz3()}>
                                Join Group Quiz
                            </Button>
                        {/* </Card.Body>
                    </Card> */}
                </>

            </div>
        </Container >
    )
}

export default HomePage;