import { FaDollarSign } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { updateGroupMember, getGroup } from '../firestore'
import styles from '../styles/new.module.scss';
import money from './../images/money.png'; // Tell webpack this JS file uses this image
import Popup, {TimedPopup} from './Popup';
import { BackButton, HomeButton } from "./Buttons";

const PriceGrab = ({ globalState, setGlobalState }) => {

    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState(5)
    const [showGroupPopup, setGroupPopup] = useState(false);
    const [loginOrAccount, setLoginOrAccount] = useState("Login")
    const MINUTE_MS = 1000;

    async function idk() {
        const groupCode = cookies["groupCode"]
        if (groupCode != 0) {
            const group = await getGroup(groupCode)
            if (group && group["skip"] != undefined) {
                console.log(group.skip)
                return group.skip
            }
            else {
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
        // default price - this is from the handleStarClick() method
        let index = cookies["price"] != "false" ? cookies["price"] : 2
        let clickStates = [...clicked];
        for (let i = 0; i < 5; i++) {
            if (i <= index) clickStates[i] = true;
            else clickStates[i] = false;
        }

        setClicked(clickStates);
        setPrice(index)
        
        if (globalState.showGroupJoinPopup) {
            setGroupPopup(true);
        }
        const interval = setInterval(() => {
            checkGroupDone()
            // console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

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
            if (cookies['groupCode'] != 0) {
                updateGroupMember(cookies['groupCode'], 'price', price + 1);
            }
            navigate("/keywordGrab");
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
            {showGroupPopup && <TimedPopup content={<b>Group Successfully Joined!</b>} onClose={() => { setGroupPopup(false); setGlobalState({ ...globalState, showGroupJoinPopup: false }); }} />}

            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
                {/* <Card className="card-control w-75 center">
                <Card.Body> */}
                <img src={money} className="image-control" alt="Logo" />
                {/* </Card.Body>
            </Card> */}
                <br></br><br></br>
                <BackButton to='/timeGrab' />
                <HomeButton />
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