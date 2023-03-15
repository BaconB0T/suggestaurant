import {useState} from "react";
import { ButtonGroup } from "react-bootstrap";
import { getFilters, getDietRest, updateDietRestrictions} from "../firestore";
import "../styles/Allergies.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth';


function Allergies(){

    const [user, setUser] = useState([]);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (!user.isAnonymous) {
        setUser(user);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        } else {
        // User is signed out
        setUser(null);
        }
    });

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const[selected, setSelected] = useState("not-selected");
    const [t, setT] = useState(false);

    if(!t && user && user.uid){
        Promise.resolve(getDietRest()).then(val =>{
            setRestList(val.names[4].values);
        });
        Promise.resolve(getFilters(user.uid)).then(val =>{
            setUserDietRest(val.filters.dietaryRestrictions)
        });
        setT(true);
    }

    // const isSelected = () => {
    //     if (usersDietRest.includes(alergy)) 
    // }

    async function isSelected(elem) {
        if (usersDietRest.includes(elem)){
            setSelected("selected")
        }
        else{setSelected('not-selected')}
    }
    // const [sel, setSel] = useState('not-selected');
    return(
        <div className="w-100" style={{ maxWidth: "400px" }}>
            <h1>Dietary Restrictions</h1>
            <ButtonGroup>
                {dietRestList.map(alergy => {
                    return (
                        <button
                        type = 'button'
                        key = {alergy}
                        id = {(usersDietRest.includes(alergy)) ? 'selected' : 'not-selected'}
                        className="mobile-wrap"
                        onClick = {(event) => {
                            let tempList = usersDietRest;
                            if (!(tempList.includes(alergy))){
                                tempList.push(alergy);
                            }
                            else{
                                tempList.splice(tempList.indexOf(alergy),1);
                            }
                            updateDietRestrictions(user.uid, tempList);
                            // if (event.target.style.backgroundColor == "red")
                            // {
                            //     event.target.style.backgroundColor = "blue"
                            // }
                            // else
                            // {
                            //     event.target.style.backgroundColor = "red"
                            // }
                            // setUserDietRest(tempList)
                            // console.log(usersDietRest)
                        }}
                        >{alergy}</button>
                    )
                })}
            </ButtonGroup>

        </div>
    )
}

export default Allergies;