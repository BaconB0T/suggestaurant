import React, {useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import TimePicker from 'react-time-picker';
import { updateGroupHost } from '../firestore';


function timeToInt(timeString) {
    return parseInt(timeString.replace(':', ''));
}

const TimeGrab = () => {
  
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState("")
    const [value, onChange] = useState('10:00');


    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("");
            setCookie('time', value, { path: '/' });
            if(cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'time', timeToInt(value));
            }
            navigate("/priceCheck");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }
    
    if((cookies['groupCode'] !== 0) && cookies['host'] !== 'true') {
        return (
            <Navigate to='/dietaryRestrictions' />
        );
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
                            <p>Time</p>
                            <div>
                                <TimePicker onChange={onChange} value={value} />
                            </div>
                            <br></br>
                            <Form onSubmit={handleSubmit}>
                                <Button className="w-40 mt-10" type="submit">
                                    Next
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container >
    )
  }

  export default TimeGrab;