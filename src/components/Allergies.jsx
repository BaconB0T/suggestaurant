import {useState} from "react";
import { ButtonGroup } from "react-bootstrap";
import {auth, getFilters, getDietRest, updateDietRestrictions} from "../firestore";

function Allergies(){

    const user = auth.currentUser;

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const [t, setT] = useState(false);

    if(!t){
        Promise.resolve(getDietRest()).then(val =>{
            setRestList(val.names[4].values);
        });
        Promise.resolve(getFilters(user.uid)).then(val =>{
            setUserDietRest(val.filters.dietaryRestrictions)
        });
        setT(true);
    }
    
    return(
        <div>
            <h1>Dietary Restrinctions</h1>
            <ButtonGroup>
                {dietRestList.map(alergy => {
                    return (
                        <button
                        onClick = {() => {
                            let tempList = usersDietRest;
                            if (!(tempList.includes(alergy))){
                                tempList.push(alergy);
                            }
                            else{
                                tempList.splice(tempList.indexOf(alergy),1);
                            }
                            updateDietRestrictions(user.uid, tempList);
                        }}
                        >{alergy}</button>

                    )
                })}
            </ButtonGroup>

        </div>
    )
}

export default Allergies;