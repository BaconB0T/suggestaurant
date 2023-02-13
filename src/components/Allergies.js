import {useState} from "react";
import {auth, getDietRest} from "../firestore";

function Allergies(){

    console.log(getDietRest);

    return(
        <div>
            <h1>Dietary Restrinctions</h1>

        </div>
    )
}

export default Allergies;