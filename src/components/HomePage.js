import React, {useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const HomePage = () => {
  
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [loginOrAccount, setLoginOrAccount] = useState("Login")


    async function handleClickQuiz() {
        try {
            navigate("/location");
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
    
    
    return(
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            <Button onClick={() => handleClickQuiz()}>
                                Start Quiz
                            </Button>
                            <br></br>
                            <br></br>
                            <Button onClick={() => handleClickLogin()}>
                                {loginOrAccount}
                            </Button>
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container >
    )
  }

  export default HomePage;