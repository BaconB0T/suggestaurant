import React, { useRef, useState, Component  } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import Geocode from "react-geocode";
import { useGeolocated } from "react-geolocated";
import { updateGroupHost } from '../firestore';
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import car from './../images/Transportation.png'; // Tell webpack this JS file uses this image
import { BsGearFill } from "react-icons/bs";



const DistanceGrab = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const latRef = useRef()
    const longRef = useRef()
    const distRef = useRef()
    const [error, setError] = useState("")
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

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


    async function handleClickBack() {
        try {
            navigate("/");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

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
            const latlong = {
                latitude: latRef.current.value,
                longitude: longRef.current.value,
                distance: distRef.current.value
            }

            setCookie('latlong', latlong, { path: '/' });
            if(cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'latlong', latlong);
            }


            navigate("/dietaryRestrictions");
            
        } catch (e) {
            // else set an error
            setError(e.message)
        }
    }

    if((cookies['groupCode'] != 0) && cookies['host'] !== 'true') {
        return (
            <Navigate to='/dietaryRestrictions' />
        );
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => handleClickBack()}/>
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
            <img src={car} className="image-control" alt="Logo" />
            <br></br><br></br>
                <>
                    {/* <Card className="card-control">
                        <Card.Body> */}
                            {
                                isGeolocationAvailable ? (
 
                                    // Check location is enable in
                                    // browser or not
                                    isGeolocationEnabled ? (
                                
                                      // Check coordinates of current
                                      // location is available or not
                                      coords ? (
                                        <div>
                                            <h3 className="text-center mb-4">Enter a travel distance!</h3>
                                            {error && <Alert variant="danger">{error}</Alert>}
                                            <Form onSubmit={handleSubmit}>
                                                <Form.Group id="latitude" className="mb-2 hidden">
                                                    <Form.Label>Latitude</Form.Label>
                                                    <Form.Control 
                                                        ref={latRef} required 
                                                        defaultValue={coords.latitude}
                                                    />
                                                </Form.Group>
                                                <Form.Group id="longitude" className="mb-2 hidden">
                                                    <Form.Label>Longitude</Form.Label>
                                                    <Form.Control 
                                                        ref={longRef} required 
                                                        defaultValue={coords.longitude}
                                                    />
                                                </Form.Group>
                                                <Form.Group id="distance" className="w-75 mb-2 center">
                                                    <Form.Control 
                                                        ref={distRef} required
                                                        defaultValue={25}
                                                    />
                                                </Form.Group>
                                                <Button className="w-75 button-control" type="submit">
                                                    Go
                                                </Button>
                                            </Form>
                                        </div>
                                      ) : (
                                        <h1>Getting the location data...</h1>   
                                      )
                                    ) : (
                                      <h1>Enable location on your browser</h1>
                                    )
                                  ) : (
                                    <h1>Please, update or change your browser </h1>
                                  )
                            }
                        {/* </Card.Body>
                    </Card> */}
                </>
            </div>
        </Container >
    );
};
export default DistanceGrab;