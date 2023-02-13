import {useState} from "react";
import { ButtonGroup } from "react-bootstrap";
import {auth, getFilters, getDietRest, updateDietRestrictions} from "../firestore";
import "../styles/Allergies.css";

function Allergies(){

    const user = auth.currentUser;

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const[selected, setSelected] = useState("not-selected");
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
        <div>
            <h1>Dietary Restrinctions</h1>
            <ButtonGroup>
                {dietRestList.map(alergy => {
                    return (
                        <button
                        type = 'button'
                        key = {alergy}
                        id = {(usersDietRest.includes(alergy)) ? 'selected' : 'not-selected'}
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