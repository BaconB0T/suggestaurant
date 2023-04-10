import React, { useRef, useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import { updateGroupHost } from '../firestore';
import car from './../images/Transportation.png'; // Tell webpack this JS file uses this image
import { BackButton } from './Buttons';
import Geocode from "react-geocode";
import Autocomplete from "react-google-autocomplete";
import validateJSON from '../security/web';

const ChangeLocation = ({ user, setGlobalState, globalState }) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [showGroupPopup, setGroupPopup] = useState(false);    
    const getenv = require('getenv')
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        // get Maps API key
        fetch('http://127.0.0.1:5000/google-maps-key')
            .then(validateJSON)
            .then((json) => {
                setApiKey(json.key);
            });
    }, []);

    Geocode.setApiKey(apiKey);
    Geocode.setLanguage("en");
    Geocode.enableDebug();
    Geocode.setLocationType("ROOFTOP");

    async function handleSubmit(place) {
        try {
            Geocode.fromAddress(place).then(
                (response) => {
                    const { lat, lng } = response.results[0].geometry.location;
                    console.log(lat, lng);
                    const latlong = {
                        latitude: lat,
                        longitude: lng,
                        distance: cookies['latlong']['distance']
                    }   
                    setCookie('latlong', latlong, { path: '/' });
                    if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                        updateGroupHost(cookies['groupCode'], 'latlong', latlong);
                    }

                    navigate("/dietaryRestrictions");
                    },
                (error) => {
                    console.error(error);
                }
              );
        } catch (e) {
            // else set an error
            console.log(e)
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
                <Autocomplete
                    apiKey={apiKey}
                    onPlaceSelected={(place) => {
                        handleSubmit(place);
                    }}
                />;
                <br></br>
                <br></br>
                <Button className="w-75 button-control" type="submit">
                    Next
                </Button>
            </div>
        </Container >
    );
};
export default ChangeLocation;