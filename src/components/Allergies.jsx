import {useState, useEffect} from "react";
import { ButtonGroup } from "react-bootstrap";
import { getFilters, getDietRest, updateDietRestrictions} from "../firestore";
import "../styles/Allergies.css";
import { getAuth } from 'firebase/auth';
import { Navigate } from "react-router-dom";


function Allergies({ user }){

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const [t, setT] = useState(false);
    
    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

    const[checked, setChecked] = useState([]);

    const [user, setUser] = useState([]);
    const auth = getAuth();


    useEffect(() =>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                Promise.resolve(getDietRest()).then(val =>{
                    setRestList(val.names[4].values);
                    
                });
                Promise.resolve(getFilters(user.uid)).then(val =>{
                    setUserDietRest(val.filters.dietaryRestrictions);
                    setChecked(val.filters.dietaryRestrictions);
                });
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
            } else {
            // User is signed out
            setUser(null);
            }
        });
    }, []);

    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else{
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
        updateDietRestrictions(user.uid, updatedList);
    };

    return(
        <div className = "checkList">
            <div className="title"> Allergies </div>
            <div className="list-container">
                {dietRestList.map((item, index) => (
                    <div key={index} className = 'test'>
                        <input className={checked.includes(item) ? 'selected' : 'notselected'} 
                        id = {'list-item' + index}
                        value={item} 
                        type="checkbox" 
                        checked= {checked.includes(item)} 
                        onClick={handleCheck}
                        hidden/>
                        <label className="item-name" for={'list-item'+ index}>{item}</label>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Allergies;