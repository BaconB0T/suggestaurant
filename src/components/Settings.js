// import { useRef } from "react";
// import { useGeolocated } from "react-geolocated";

// export default function Settings({ geo, setGlobalState }) {
//   const { coords, isGeolocationAvailable, isGeolocationEnabled } = geo;
//   const geoToggle = useRef(isGeolocationEnabled);

//   function toggleGeo(newState) {
//     if(newState === true) {
//       // Toggle geo services on
//       const { c, iga, ige } = useGeolocated({
//         positionOptions: {
//             enableHighAccuracy: false,
//         },
//         userDecisionTimeout: 5000,
//       });

//       setGlobalState(prevState => ({...prevState, geo: {
//           coords: c,
//           isGeolocationAvailable: iga,
//           isGeolocationEnabled: ige
//         }})
//       );
//     } else {
//       // Toggle geo services off

//     }
//   }

//   function toggleLocation(e) {
//     isGeolocationAvailable ? 
//       isGeolocationEnabled ? "if true" : updateGeo() : "not available." 
//   }

//   return (
//     <>
//       <input type='checkbox' id='locationServicesCheckbox' 
//         ref={geoToggle}
//         checked={props.isGeolocationEnabled} onClicked={toggleLocation} />
//     </>
//   )
// }