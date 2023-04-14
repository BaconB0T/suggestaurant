import React, { useRef, useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import { useGeolocated } from "react-geolocated";
import { updateGroupHost } from '../firestore';
import car from './../images/Transportation.png'; // Tell webpack this JS file uses this image
import Popup, {TimedPopup} from './Popup';
import { BackButton } from './Buttons';

const DistanceGrab = ({ user, setGlobalState, globalState }) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const latRef = useRef()
    const longRef = useRef()
    const distRef = useRef()
    const [error, setError] = useState("")
    const [showGroupPopup, setGroupPopup] = useState(false);

    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

    async function changeLocation()
    {
        const latlong = {
            latitude: latRef.current.value,
            longitude: longRef.current.value,
            distance: distRef.current.value
        }

        setCookie('latlong', latlong, { path: '/' });
        if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
            updateGroupHost(cookies['groupCode'], 'latlong', latlong);
        }
        navigate("/changeLocation");
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
            if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'latlong', latlong);
            }


            navigate("/dietaryRestrictions");

        } catch (e) {
            // else set an error
            setError(e.message)
        }
    }

    useEffect(() => {
        if (globalState.showGroupHostPopup) {
            setGroupPopup(true);
        }
    }, []);

    if ((cookies['groupCode'] != 0) && cookies['host'] !== 'true') {
        return (
            <Navigate to='/dietaryRestrictions' />
        );
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            {showGroupPopup && <TimedPopup content={<b>Group Successfully Created!</b>} onClose={() => { setGroupPopup(false); setGlobalState({...globalState, showGroupHostPopup: false}); }} />}
            <BackButton to='/' />
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
                                                <Form.FloatingLabel label="Distance in Miles">
                                                    <Form.Control
                                                        ref={distRef} required
                                                        defaultValue={25}
                                                        placeholder="Miles"
                                                    />
                                                </Form.FloatingLabel>
                                            </Form.Group>
                                            <Button className="w-75 button-control" type="submit">
                                                Next
                                            </Button>
                                        </Form>
                                        <br></br>
                                        <Button className="w-75 button-control" onClick={() => changeLocation()}>
                                                Change Location
                                        </Button>
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