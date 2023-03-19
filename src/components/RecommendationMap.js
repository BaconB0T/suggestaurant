import { useState, useEffect } from 'react';
import validateJSON from '../security/web';
import GoogleMapReact from 'google-map-react';
// import Marker from 'google-map-react';
import { Button } from 'react-bootstrap';
import { getLastVisitedRestaurant, getRestaurantById, setLastVisitedRestaurant } from '../firestore';
import { Navigate } from 'react-router-dom';
import {getAuth} from "firebase/auth";

const ShareIcon = ({provider}) => {
    return (
        <>
            <span>{provider}</span>
            <Button onClick={() => alert(`Share with ${provider}`)}>
                <img src='https://placeholder.com/50x50'/>
            </Button>
        </>
    );
}

const RecommendationMap = ({state: globalState, business_id: id}) => {
    const zoomLevel = 15;
    // console.log(globalState);
    const business_id = globalState.business_id || id;
    const [apiKey, setApiKey] = useState('');
    const [res, setRes] = useState('');
    const supportedProviders = ['Twitter', 'Email', 'Telegram', 'WhatsApp', 'Facebook'];

    useEffect(() => {
        // get Maps API key
        fetch('http://127.0.0.1:5000/google-maps-key')
            .then(validateJSON)
            .then((json) => {
                setApiKey(json.key);
            });
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
        console.log("userID:")
        console.log(getAuth().currentUser)
        console.log("restID:")
        console.log(restId)
        console.log("getting restaurant from firestore!!!")
        console.log(getLastVisitedRestaurant(getAuth().currentUser.uid))
        setLastVisitedRestaurant(getAuth().currentUser.uid, restId)
        window.open("https://www.google.com/maps/dir/?api=1&destination="+loc.latitude+","+loc.longitude);
    }

    function shareIcons() {
        return supportedProviders.map((provider) => <ShareIcon key={provider} provider={provider}></ShareIcon>);
    }

    function clipboardAddress(loc) {
        const addr = `${loc.streetAddress} ${loc.city}, ${loc.state} ${loc.postalCode}`;
        navigator.clipboard.writeText(addr).then(() => {
            console.log(`Copied addres to clipboard`);
        });
    }
    // console.log('res');
    // console.log(res);
    if(apiKey === '' || apiKey === null || res === '') {
        // restaurant has not been fetched yet.
        // console.log('loading')
        return (
            <>
                <p className='loading-animation'>Loading...</p>
            </>
        );
        // apiKey !== '' && apiKey !== null &&
    } else if(res !== null) {
        const googleLocation = {
            address: `${res.location.streetAddress}, ${res.location.city}, ${res.location.state}`,
            lat: res.location.latitude,
            lng: res.location.longitude,
            // label: "Hello!"
        };
        const loc = res.location;

        return (
            <>
                {/* TODO: Disable drag/recenter */}
                <div className="google-map" style={{height:'30vh',width:'80%'}}>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: apiKey }}
                        center={googleLocation}
                        zoom={zoomLevel}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({map, maps}) => handleApiLoaded(map, maps, [googleLocation])}
                    >
                    </GoogleMapReact>
                </div>

                <h1>{res.name}</h1>
                <div>{loc.streetAddress}</div>
                <div style={{display: 'inline'}}>{loc.city}, {loc.state} {loc.postalCode}</div>
                <Button onClick={(loc) => {clipboardAddress(loc)}}>Copy Address</Button>
                <Button style={{display: 'block'}} onClick={(loc) => {openInApp(business_id, loc)}}>Take me there!</Button>
                <div>Share with your friends by clicking the icons below!</div>
                <div id='share-icons'>
                    <ul id='icons-list'>
                        {shareIcons()}
                    </ul>
                </div>
            </>
        );
    } else {
        return (
            <>
                <Navigate to='/recommendations'/>
                <p>TODO: Finish. Restaurant doesn't exist.</p>
            </>
        );
    }
}

export default RecommendationMap;