import {useState} from "react";
import { ButtonGroup } from "react-bootstrap";
import {auth, getDietRest} from "../firestore";

function Allergies(){

    const[dietRestList, setRestList] = useState([]);
    const[usersDietRest, setUserDietRest] = useState([]);
    const [t, setT] = useState(false);

    if(!t){
        Promise.resolve(getDietRest()).then(val =>{
            setRestList(val.names[4].values);
        });
        setT(true);
    }

    // console.log(t);

    // console.log(dietRestList);


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
                            setUserDietRest(tempList);
                            console.log(usersDietRest);
                        }}
                        >{alergy}</button>

                    )
                })}
            </ButtonGroup>
            {/* {console.log(usersDietRest)} */}

        </div>
    )
}

export default Allergies;