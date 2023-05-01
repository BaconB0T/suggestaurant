import React from 'react';
import { Container, Button, Form, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import { updateGroupHost } from '../firestore';
import car from './../images/Transportation.png'; // Tell webpack this JS file uses this image
import { BackButton } from './Buttons';
import Geocode from "react-geocode";
import Autocomplete from "react-google-autocomplete";
import { useState } from 'react';
import { useRef } from 'react';

const ChangeLocation = () => {
    const [error, setError] = useState("");
    const [cookies, setCookie] = useCookies(['user']);
    const [latlong, setLatlong] = useState({});
    const distRef = useRef();
    const placeRef = useRef();
    const navigate = useNavigate();
    const apiKey = 'AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I';
    Geocode.setApiKey(apiKey);

    async function handleChange(place) {
        const formatted_address = (typeof place === "string") ? place : place.formatted_address;
        try {
            const response = await Geocode.fromAddress(formatted_address)
            const { lat, lng } = response.results[0].geometry.location;
            setLatlong(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng
            }));
            return true;
        } catch (error) {
            console.error(error);
            setError("Invalid city/location.");
            return false;
        }
    }

    async function validateForm(latlong) {
        try {
            if (!(await handleChange(placeRef.current.value))) {
                throw new Error("We can't find that city, please double check the spelling and try again.")
            }
            if(!latlong.latitude || !latlong.longitude) {
                throw new Error("You must select a city from the dropdown below.")
            }
            if (!latlong.distance) {
                throw new Error("You must specify a distance.")
            }
            if (latlong.distance < 1) {
                throw new Error("Distance must be at least 1 mile.");
            }
            if (isNaN(latlong.distance)) {
                throw new Error("Distance must be a number.");
            }
            return true;
        } catch (e) {
            setError(e.message);
            return false;
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        if(await validateForm(latlong)) {
            setCookie('latlong', latlong, { path: '/' });
            
            if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'latlong', latlong);
            }
    
            navigate("/dietaryRestrictions");
        }
    }

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
            <BackButton to='/' />
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
                <img src={car} className="image-control" alt="Car" />
                <h3 className="text-center mb-4">Enter a Location!</h3>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group id="place" className="w-75 mb-2 center">
                        <Form.FloatingLabel label="City">
                            <Autocomplete
                                className='form-control'
                                apiKey={apiKey}
                                ref={placeRef}
                                onPlaceSelected={(place) => {
                                    handleChange(place);
                                }}
                                placeholder="Pittsburgh, PA"
                                required={true}
                                />
                        </Form.FloatingLabel>
                    </Form.Group>
                    <Form.Group id="distance" className="w-75 mb-2 center">
                        <Form.FloatingLabel label="Distance in Miles">
                            <Form.Control
                                ref={distRef} required
                                defaultValue={cookies["latlong"] != "false" ? cookies["latlong"]["distance"] : 25}
                                placeholder="25"
                                onChange={() => setLatlong(prev => ({...prev, distance: distRef.current.value}))}
                            />
                        </Form.FloatingLabel>
                    </Form.Group>
                    <Button className="w-75 mt-10 button-control" type="submit">
                        Next
                    </Button>
                </Form>
            </div>
        </Container>
    );
};
export default ChangeLocation;