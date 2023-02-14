import { useState, useEffect } from 'react';
import validateJSON from '../security/web';
import GoogleMapReact from 'google-map-react';
// import Marker from 'google-map-react';
import { Button } from 'react-bootstrap';
import clipboardy from 'clipboardy';

const ShareIcon = ({provider}) => {
    return (
        <>
            <span style={{display: 'inline'}}>{provider}</span>
            <Button onClick={() => alert(`Share with ${provider}`)}>
                <img src='https://placeholder.com/50x50'/>
            </Button>
        </>
    );
}

const RecommendationMap = ({ res }) => {
    const zoomLevel = 15;
    const loc = res.location;
    const [apiKey, setApiKey] = useState('');
    const location = {
        address: `${loc.streetAddress}, ${loc.city}, ${loc.state}`,
        lat: loc.latitude,
        lng: loc.longitude,
        label: "Hello!"
    }

    const supportedProviders = ['Twitter', 'Email', 'Telegram', 'WhatsApp', 'Facebook'];

    useEffect(() => {
        const getApiKey = () => {
            fetch('http://127.0.0.1:5000/google-maps-key')
                .then(validateJSON)
                .then((json) => {
                    setApiKey(json.key);
                });
        }
        getApiKey();
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

    function openInApp() {
        window.open("https://www.google.com/maps/dir/?api=1&destination="+loc.latitude+","+loc.longitude);
    }

    function shareIcons() {
        return supportedProviders.map((provider) => <ShareIcon key={provider} provider={provider}></ShareIcon>);
    }

    function clipboardAddress() {
        const addr = `${loc.streetAddress} ${loc.city}, ${loc.state} ${loc.postalCode}`;
        clipboardy.write(addr).then(() => {
            console.log(`Copied addres to clipboard`);
        });
    }

    // api key AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I
    if(apiKey !== '' && apiKey !== null) {
        return (
            <>
                {/* TODO: Disable drag/recenter */}
                <div className="google-map" style={{height:'30vh',width:'80%'}}>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: apiKey }}
                        center={location}
                        zoom={zoomLevel}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({map, maps}) => handleApiLoaded(map, maps, [location])}
                    >
                    </GoogleMapReact>
                    <h1>{res.name}</h1>
                    <div>{loc.streetAddress}</div>
                    <div style={{display: 'inline'}}>{loc.city}, {loc.state} {loc.postalCode}</div>
                    <Button onClick={clipboardAddress}>Copy Address</Button>
                    <Button style={{display: 'block'}} onClick={openInApp}>Take me there!</Button>
                    <div>Share with your friends by clicking the icons below!</div>
                    <div id='share-icons'>
                        <ul id='icons-list'>
                            {shareIcons()}
                        </ul>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                <p className='loading-animation'>Loading...</p>
            </>
        );
    }

}

export default RecommendationMap;