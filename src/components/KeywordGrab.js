import React, { useRef, useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, updateGroupMember, validateUser, getGroup } from '../firestore'
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import { BsGearFill } from "react-icons/bs";
import image from './../images/Restaurant.png'; // Tell webpack this JS file uses this image


const KeywordGrab = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const keywordRef = useRef()
    const [error, setError] = useState("")
    const [urlString, setURL] = useState("")
    const [loginOrAccount, setLoginOrAccount] = useState("Login")
    const [check, setCheck] = useState(false)

    async function updateVars() {
        setCheck(!check)
    }
    const MINUTE_MS = 1000;

    useEffect(() => {
        const interval = setInterval(() => {
            updateVars()
            // console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    useEffect(() => {
        async function idk() {
            const groupCode = cookies["groupCode"]
            const group = await getGroup(groupCode)
            return group.hostReady
        }
        console.log('inside use effect')
        idk().then((retVal) => {
            if (retVal == true) {
                navigate("/group/waiting")
            }
        })
    }, [check]);

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
            navigate("/");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickBack() {
        try {
            navigate("/priceCheck");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            setCookie('keywords', keywordRef.current.value, { path: '/' });
            
            const jsonData = {
                keywords: keywordRef.current.value,
                time: cookies["time"],
                price: cookies["price"],
                diet: cookies["diet"],
                latlong: cookies["latlong"] || null,
                groupCode: cookies["groupCode"],
                host: cookies["host"]
            }

            // object for storing and using data
            // Using useEffect for single rendering
            // Using fetch to fetch the api from
            // flask server it will be redirected to proxy
            let url = '';
            if (cookies["groupCode"] != 0)
            {
                updateGroupMember(cookies['groupCode'], 'keywords', keywordRef.current.value);
            }
            if (cookies['groupCode'] != 0 && cookies["host"] != 'false')
            {
                navigate("/group/waiting")
                return
                console.log("AFTER GROUP/WAITING NAV")
            }
            if (cookies["groupCode"] != 0)
            {
                navigate("/group/waiting")
                return
            }

            fetch("http://localhost:5000/data", {
                method:"POST",
                cache: "no-cache",
                headers:{
                    "content_type":"application/json",
                    'Access-Control-Allow-Origin':'*'
                },
                body:JSON.stringify(
                        jsonData
                    )
                }
            ).then(response => {
                return response.json();
            })
            .then(json => {
                setCookie("businesslist", json, { path: '/' });
                if (json.length == 0)
                {
                    navigate("/expandRadius");
                }
                else
                {
                    navigate("/recommendations");
                }
            })
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
            <img src={image} className="image-control" alt="Logo" />
            <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => handleClickBack()}/>
            <FaHome className = "w-20 icon-control login-or-account" onClick={() => handleClickSettings()}/>
                <>
                    {/* <Card className = "card-control">
                        <Card.Body> */}
                            <h3 className="text-center mb-4">Enter some keywords!</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit} className="w-75 center">
                                <Form.Group id="keywords" className="mb-2" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control ref={keywordRef} required
                                        defaultValue={cookies["keywords"]}
                                        as="textarea" 
                                        rows={3}/>
                                </Form.Group>
                                <Button className="w-75 mt-10 button-control" type="submit">
                                    Go
                                </Button>
                            </Form>
                        {/* </Card.Body>
                    </Card> */}
                </>

            </div>
        </Container >

    );
};
export default KeywordGrab;