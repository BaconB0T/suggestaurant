import { useNavigate } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';

const LocationPin = ({ text }) => {
    <div className="pin">
        {/* <Icon icon={locationIcon} className="pin-icon" /> */}
        <p className="pin-text">{text}</p>
    </div>
};

const RecommendationMap = ({ loc, zoomLevel }) => {
    const location = {
        address: `${loc.streetAddress}, ${loc.city}, ${loc.state}`,
        lat: loc.latitude,
        lng: loc.longitude,
    }
    // api key AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I
    return (
        <>
            <div className="google-map">
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyAp8sYE38PFm7ZUDyBCbSejwQyclvHtW6I' }}
                    defaultCenter={location}
                    defaultZoom={zoomLevel}>
                    <LocationPin
                        lat={location.lat}
                        lng={location.lng}
                        text={location.address}
                    />
                </GoogleMapReact>
            </div>
        </>
    );
}

export default RecommendationMap;