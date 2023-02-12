import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import validateJSON from '../security/web';
import GoogleMapReact from 'google-map-react';
// import Marker from 'google-map-react';
import { getRestaurant } from '../firestore';

const LocationPin = ({ text }) => <div>{text}</div>;

const RecommendationMap = ({ loc, zoomLevel }) => {
    const [apiKey, setApiKey] = useState('');
    const location = {
        address: `${loc.streetAddress}, ${loc.city}, ${loc.state}`,
        lat: loc.latitude,
        lng: loc.longitude,
        label: "Hello!"
    }

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

    // api key AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I
    if(apiKey !== '' && apiKey !== null) {
        return (
            <>
                {/* TODO: Disable drag/recenter */}
                <div className="google-map" style={{height:'100vh',width:'100%'}}>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: apiKey }}
                        center={location}
                        zoom={zoomLevel}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({map, maps}) => handleApiLoaded(map, maps, [location])}
                    >
                    </GoogleMapReact>
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