import {useState, useEffect} from "react";
import { getFilters, getDietRest, updateDietRestrictions} from "../firestore";
import "../styles/Allergies.css";
import { useNavigate,Navigate } from "react-router-dom";
import { Container, Card } from "react-bootstrap";
import { BackButton, HomeButton } from './Buttons';

function Allergies({ user }){

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const [t, setT] = useState(false);
    const[checked, setChecked] = useState([]);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() =>{
        if (!(user.isAnonymous)) {
            Promise.resolve(getDietRest()).then(val =>{
                setRestList(val.names[4].values);
                
            });
            Promise.resolve(getFilters(user.uid)).then(val =>{
                setUserDietRest(val.filters.dietaryRestrictions);
                setChecked(val.filters.dietaryRestrictions);
            });
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
        }
    }, []);
    
    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

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
       <Container
            className="d-flex align-items-center justify-content-center overflow-auto"
            style={{ minHeight: "100vh" }}
        >
        <BackButton to='/account'/>
        <HomeButton/>
         <div className = "checkList">
            <h2> Allergies </h2>
            <Card className="card-control">
                <Card.Body>
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
                </Card.Body>
            </Card>         
        </div>
       </Container>
    );
}

export default Allergies;