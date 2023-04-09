import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import {BackButton, HomeButton } from './Buttons';

const ExpandRadius = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const distRef = useRef()

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
                            <h2 className="text-center mb-4">No Matches Found!</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="distance" className="mb-2">
                                    <Form.Label>Increase Your Distance</Form.Label>
                                    <Form.Control 
                                        ref={distRef} required
                                        defaultValue={cookies["latlong"]["distance"]}
                                    />
                                </Form.Group>
                                <Button className="w-40 mt-10" type="submit">
                                    Expand Radius
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