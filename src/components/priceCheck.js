import { FaDollarSign } from "react-icons/fa";
import React, {useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, updateGroupMember, getGroup } from '../firestore'
import styles from '../styles/new.module.scss';
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import { BsGearFill } from "react-icons/bs";
import money from './../images/money.png'; // Tell webpack this JS file uses this image


const PriceGrab = () => {
  
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState(5)
    const [loginOrAccount, setLoginOrAccount] = useState("Login")
    const MINUTE_MS = 1000;

    async function idk() {
        const groupCode = cookies["groupCode"]
        if (groupCode != 0)
        {
            const group = await getGroup(groupCode)
            if (group && group["hostReady"] != undefined)
            {
                console.log(group.hostReady)
                return group.hostReady
            }
            else
            {
                return false
            }
        }
    }

    async function checkGroupDone() {
        idk().then((retVal) => {
            if (retVal == true) {
                navigate("/recommendations/waiting")
                return
            }
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            checkGroupDone()
            // console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])


    async function handleClickBack() {
        try {
            navigate("/timeGrab");
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

    async function handleClickLogin() {
        try {
            navigate("/login");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }


    const handleStarClick = (e, index) => {
      e.preventDefault();
      let clickStates = [...clicked];
      for (let i = 0; i < 5; i++) {
        if (i <= index) clickStates[i] = true;
        else clickStates[i] = false;
      }
  
      setClicked(clickStates);
      setPrice(index)
    };

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")

            setCookie('price', price + 1, { path: '/' });
            if(cookies['groupCode'] != 0) {
                updateGroupMember(cookies['groupCode'], 'price', price+1);
            }
            navigate("/keywordGrab");
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
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
            {/* <Card className="card-control w-75 center">
                <Card.Body> */}
                    <img src={money} className="image-control" alt="Logo" />
                {/* </Card.Body>
            </Card> */}
            <br></br><br></br>
            <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => handleClickBack()}/>
            <FaHome className = "w-20 icon-control login-or-account" onClick={() => handleClickSettings()}/>
                <>
                            <div className={styles.rating}>
                                <h3>Select a price point!</h3>
                                <br></br>
                                <div>
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 0)}
                                        className={clicked[0] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 1)}
                                        className={clicked[1] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 2)}
                                        className={clicked[2] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 3)}
                                        className={clicked[3] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 4)}
                                        className={clicked[4] ? styles.clickeddollar : null}
                                    />
                                </div>
                            </div> 
                            <br></br>
                            <Form onSubmit={handleSubmit}>
                                <Button className="w-50 mt-10 button-control" type="submit">
                                    Next
                                </Button>
                            </Form>
                </>
            </div>
        </Container >
    )
  }

  export default PriceGrab;