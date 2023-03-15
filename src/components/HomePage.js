import React, {useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import logo from './../images/logo.png'; // Tell webpack this JS file uses this image
import { BsGearFill } from "react-icons/bs";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { RiLoginBoxLine } from "react-icons/ri"

const HomePage = () => {
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [loginOrAccount, setLoginOrAccount] = useState("Login")

    async function handleClickLogin() {
        try {
            navigate("/login");
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
    
    return(
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <FaRegUserCircle className = "w-20 icon-control login-or-account" onClick={() => handleClickLogin()}>
                {loginOrAccount}
            </FaRegUserCircle>
            <BsGearFill className = "w-20 icon-control settings" onClick={() => handleClickSettings()}/>
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px"}}>
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