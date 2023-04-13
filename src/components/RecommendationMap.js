import validateJSON from '../security/web';
import GoogleMapReact from 'google-map-react';
import { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';
import { getRestaurantById, setLastVisitedRestaurant } from '../firestore';
import { Navigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { CopyButton, HomeButton } from './Buttons';
import { Container } from "react-bootstrap";
import { SocialIcon } from 'react-social-icons';
import '../styles/RecommendationsMap.css'

const RecommendationMap = ({ globalState, business_id: id }) => {
    const zoomLevel = 15;
    // console.log(globalState);
    const business_id = globalState.business_id || id;
    const [apiKey, setApiKey] = useState('');
    const [res, setRes] = useState('');

    useEffect(() => {
        // get Maps API key
        fetch('https://suggestaurantapp-3sgrjmlphq-uc.a.run.app/google-maps-key')
            .then(validateJSON)
            .then((json) => {
                setApiKey(json.key);
            });
        if (business_id !== undefined) {
            getRestaurantById(business_id)
                .then((doc) => {
                    setRes(doc);
                    console.log(doc);
                });
        }
    }, []);

    const handleApiLoaded = (map, maps, places) => {
        const markers = [];
        const infowindows = [];

        places.forEach((place) => {
            markers.push(new maps.Marker({
                position: {
                    lat: place.lat,
                    lng: place.lng,
                },
                label: place.label,
                map,
            }));
        });
    };

    function openInApp(restId, loc) {
        // console.log("userID:")
        // console.log(getAuth().currentUser)
        // console.log("restID:")
        // console.log(restId)
        // console.log("getting restaurant from firestore!!!")
        // console.log(getLastVisitedRestaurant(getAuth().currentUser.uid))
        setLastVisitedRestaurant(getAuth().currentUser.uid, restId)
        // console.log(loc);
        window.open("https://www.google.com/maps/dir/?api=1&destination=" + loc.latitude + "," + loc.longitude);
    }

    function shareIcons() {
        const supportedProviders = [
            'Twitter',
            'Email',
            'Telegram',
            'WhatsApp',
            'Facebook'
        ];
        return supportedProviders.map((url, idx) => <SocialIcon key={idx} url={url} />);
    }

    function clipboardAddress(res, loc) {
        const addr = `${res.name}, ${loc.streetAddress} ${loc.city}, ${loc.state} ${loc.postalCode}`;
        // navigator.clipboard.writeText(addr).then(() => {
        //     console.log(`Copied addres to clipboard`);
        // });
        return addr;
    }
    // console.log('res');
    // console.log(res);
    if (apiKey === '' || apiKey === null || res === '') {
        // restaurant has not been fetched yet.
        // console.log('loading')
        return (
            <>
                <p className='loading-animation'>Loading...</p>
            </>
        );
        // apiKey !== '' && apiKey !== null &&
    } else if (res !== null) {
        const googleLocation = {
            address: `${res.location.streetAddress}, ${res.location.city}, ${res.location.state}`,
            lat: res.location.latitude,
            lng: res.location.longitude,
            // label: "Hello!"
        };
        const loc = res.location;

        return (
            <Container
                className="main-content flex-column align-items-center overflow-auto"
                style={{ minHeight: "100vh" }}
            >
                <HomeButton />
                <Card className='custom-card'>
                    <Card.Header >{res.name}</Card.Header>
                    {/* TODO: Disable drag/recenter */}
                    <div className="google-map" style={{ height: '30vh'}}>
                        <GoogleMapReact
                            bootstrapURLKeys={{ key: apiKey }}
                            center={googleLocation}
                            zoom={zoomLevel}
                            yesIWantToUseGoogleMapApiInternals
                            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, [googleLocation])}
                        >
                        </GoogleMapReact>
                    </div>
                    <Card.Body>
                        <h1>{res.name}</h1>
                        <div id='address' className='address'>
                            <div>
                                <div>{loc.streetAddress}</div>
                                <div>{loc.city}, {loc.state} {loc.postalCode}</div>
                            </div>
                            <div className='ms-2'>
                                <CopyButton textToCopy={clipboardAddress(res, loc)} />
                            </div>
                        </div>
                        <div className='in-app-button-container'>
                            <div className='in-app-button'>
                                <Button onClick={() => { openInApp(business_id, loc) }}>Take me there</Button>
                            </div>
                        </div>
                        <div id='share-icons' className='icons-div'>
                            <div>Share with your friends by clicking the icons below!</div>
                            <div id='icons-list' className='icons-list'>
                                {shareIcons()}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    } else {
        return (
            <>
                <Navigate to='/recommendations' />
                <p>TODO: Finish. Restaurant doesn't exist.</p>
            </>
        );
    }
}

export default RecommendationMap;