import React, { useRef, useState, Component  } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Geocode from "react-geocode";
import { useGeolocated } from "react-geolocated";

const DistanceGrab = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const latRef = useRef()
    const longRef = useRef()
    const [error, setError] = useState("")
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            
            // // Get latitude & longitude from address.
            // Geocode.fromAddress("Eiffel Tower").then(
            //     (response) => {
            //     const { lat, lng } = response.results[0].geometry.location;
            //     console.log(lat, lng);
            //     },
            //     (error) => {
            //     console.error(error);
            //     }
            // );
            const latlong = [latRef, longRef]

            setCookie('latlong', latlong, { path: '/' });

            navigate("/dietaryRestrictions");
            
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
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            {
                                isGeolocationAvailable ? (
 
                                    // Check location is enable in
                                    // browser or not
                                    isGeolocationEnabled ? (
                                
                                      // Check coordinates of current
                                      // location is available or not
                                      coords ? (
                                        <div>
                                            <h2 className="text-center mb-4">We've pulled your Location</h2>
                                            {error && <Alert variant="danger">{error}</Alert>}
                                            <Form onSubmit={handleSubmit}>
                                                <Form.Group id="latitude" className="mb-2">
                                                    <Form.Label>Latitude</Form.Label>
                                                    <Form.Control 
                                                        ref={latRef} required 
                                                        defaultValue={coords.latitude}
                                                    />
                                                </Form.Group>
                                                <Form.Group id="longitude" className="mb-2">
                                                    <Form.Label>Longitude</Form.Label>
                                                    <Form.Control 
                                                        ref={longRef} required 
                                                        defaultValue={coords.longitude}
                                                    />
                                                </Form.Group>
                                                <Button className="w-40 mt-10" type="submit">
                                                    Go
                                                </Button>
                                            </Form>
                                        </div>
                                      ) : (
                                        <h1>Getting the location data...</h1>   
                                      )
                                    ) : (
                                      <h1>Please enable location on your browser</h1>
                                    )
                                  ) : (
                                    <h1>Please, update or change your browser </h1>
                                  )
                            }
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container >
    );
};
export default DistanceGrab;