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
    const business_id = globalState.business_id || id;
    // TODO: source this from some config. At least don't hardcode it here.
    const apiKey = 'AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I';
    const [res, setRes] = useState('');

    useEffect(() => {
        // get Maps API key
        if(business_id !== undefined) {
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
        setLastVisitedRestaurant(getAuth().currentUser.uid, restId);
        window.open(google_maps_href(loc));
    }
    function google_maps_href(loc) {
        return "https://www.google.com/maps/dir/?api=1&destination="+loc.latitude+","+loc.longitude;
    }

    function shareIcons(res, loc) {
        console.log('loc');
        console.log(loc);
        console.log('res');
        console.log(res);
        const supportedProviders = [
            'Twitter', 
            'Email', 
            'https://t.me/share/url?url='+encodeURIComponent(google_maps_href(loc))+"&text=" + encodeURI(`Let's eat at ${res.name}!`), 
            'WhatsApp', 
            'Facebook'
        ];
        return supportedProviders.map((url, idx) => {console.log(url); return (<SocialIcon key={idx} url={url} />)});
    }

    function clipboardAddress(res, loc) {
        const addr = `${res.name}, ${loc.streetAddress} ${loc.city}, ${loc.state} ${loc.postalCode}`;
        return addr;
    }
    
    if(res === '') {
        // restaurant has not been fetched yet.
        return (
            <>
                <p className='loading-animation'>Loading...</p>
            </>
        );
    } else if(res !== null) {
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
                                {shareIcons(res, loc)}
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