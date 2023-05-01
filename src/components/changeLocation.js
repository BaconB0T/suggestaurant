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
    const defaultDistance = 25;
    const [error, setError] = useState("");
    const [cookies, setCookie] = useCookies(['user']);
    const [latlong, setLatlong] = useState({
        distance: cookies['latlong']['distance'] || defaultDistance,
        latitude: null,
        longitude: null,
    });
    const distRef = useRef();
    const placeRef = useRef();
    const navigate = useNavigate();
    const apiKey = 'AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I';
    Geocode.setApiKey(apiKey);

    async function changeLatlong(place) {
        console.log(place);
        const formatted_address = (typeof place === "string") ? place : place.formatted_address;
        try {
            const response = await Geocode.fromAddress(formatted_address)
            const { lat, lng } = response.results[0].geometry.location;
            return {
                ...latlong,
                latitude: lat,
                longitude: lng
            }
        } catch (error) {
            console.error(error);
            setError("Invalid city/location.");
            return false;
        }
    }

    async function validateForm(newLatlong) {
        try {
            if (!newLatlong) {
                throw new Error("We can't find that city, please double check the spelling and try again.")
            }
            if(!newLatlong.latitude || !newLatlong.longitude) {
                throw new Error("You must select a city from the dropdown below.")
            }
            if (!newLatlong.distance) {
                throw new Error("You must specify a distance.")
            }
            if (newLatlong.distance < 1) {
                throw new Error("Distance must be at least 1 mile.");
            }
            if (isNaN(newLatlong.distance)) {
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
        const newLatlong = await changeLatlong(placeRef.current.value);
        if(await validateForm(newLatlong)) {
            setCookie('latlong', newLatlong, { path: '/' });
            
            if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'latlong', newLatlong);
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
                                    changeLatlong(place);
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
                                defaultValue={cookies["latlong"] != "false" ? cookies["latlong"]["distance"] : defaultDistance}
                                placeholder={defaultDistance}
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