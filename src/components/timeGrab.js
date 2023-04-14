import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import TimePicker from 'react-time-picker';
import { updateGroupHost } from '../firestore';
import time from './../images/time.png'; // Tell webpack this JS file uses this image
import { HomeButton, BackButton } from './Buttons';

function timeToInt(timeString) {
    return parseInt(timeString.replace(':', ''));
}

const TimeGrab = () => {
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState("")
    
    const currentDate = new Date();
    const zeroFilledHours = ('00'+currentDate.getHours()).slice(-2);
    const zeroFilledMinutes = ('00'+currentDate.getMinutes()).slice(-2);

    const [value, onChange] = useState(zeroFilledHours + ":" + zeroFilledMinutes);

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("");
            setCookie('time', value, { path: '/' });
            if (cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'time', timeToInt(value));
            }
            navigate("/priceCheck");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    if ((cookies['groupCode'] != 0) && cookies['host'] !== 'true') {
        return (
            <Navigate to='/priceCheck' />
        );
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-60" style={{ maxWidth: "400px" }}>
                <img src={time} className="image-control" alt="Logo" />
                <BackButton to='/dietaryRestrictions' />
                <HomeButton />
                <>
                    <h3>Select a time to eat!</h3>
                    <br></br>
                    <Card className="card-control">
                        <Card.Body>
                            <TimePicker onChange={onChange} value={value} disableClock={true} />
                        </Card.Body>
                    </Card>
                    <br></br>
                    <Form onSubmit={handleSubmit}>
                        <Button className="w-75 mt-10 button-control" type="submit">
                            Next
                        </Button>
                    </Form>

                </>
            </div>
        </Container >
    )
}

export default TimeGrab;