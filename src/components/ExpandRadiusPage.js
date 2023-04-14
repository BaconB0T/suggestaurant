import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import {BackButton, HomeButton } from './Buttons';

const ExpandRadius = ({globalState}) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const distRef = useRef()
    const [reason, setReason] = useState()

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            
            const latlong = {
                latitude: cookies["latlong"]["latitude"],
                longitude: cookies["latlong"]["longitude"],
                distance: distRef.current.value
            }
            console.log("check2")
            setCookie('latlong', latlong, { path: '/' });

            navigate("/keywordGrab");

        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    function renderSwitch() 
    {
        if (globalState.failedToFind != false)
        {
            console.log(globalState.failedToFind)
            switch(globalState.failedToFind){
                case "1":
                    return (<h2 className="text-center mb-4">No Matches In Your Area!</h2>)
                case "2":
                    return (<h2 className="text-center mb-4">No Matches At Your Price!</h2>)
                case "3":
                    return (<h2 className="text-center mb-4">No Matches At Your Times!</h2>)
                case "4":
                    return (<h2 className="text-center mb-4">No Matches<br></br>With Your Allergy Restrictions!</h2>)
                case "5":
                    return (<h2 className="text-center mb-4">No Matches<br></br>With Your Preferences!</h2>)
                default:
                    return (<h2 className="text-center mb-4">No Matches In Your Area!</h2>)
            }
        }
        else
        {
            return (<></>)
        }
    }
    
    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <BackButton to='/location'/>
            <HomeButton/>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            {renderSwitch()}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="distance" className="mb-2">
                                    <Form.FloatingLabel label="Distance in Miles">
                                        <Form.Control
                                            ref={distRef} required
                                            defaultValue={cookies["latlong"]["distance"]}
                                            placeholder="Miles"
                                        />
                                    </Form.FloatingLabel>
                                </Form.Group>
                                <Button className="w-40 mt-10 button-control" type="submit">
                                    Expand Radius?
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container>

    );
};
export default ExpandRadius;