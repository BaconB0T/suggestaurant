import {useState} from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import {auth} from '../firestore';

function PreSetCuisines(){
    const user = auth.currentUser;

    const [listOfCuisines, setCuisineList] = useState([]);
    const [userCuisineList, setUserCuisine] = useState([]);
    const [t, setT] = useState(false);

    if(!t){
        //getInformation
        setT(true);
    }


    return(
        <div>
            <h1>Select Some Cuisines</h1>
            <ButtonGroup>
                {listOfCuisines.map(cuisine =>{
                    return(
                        <button
                        type = 'button'
                        key = {cuisine}
                        id = 'cuisine'
                        onClick = {() => {
                            let tempList = userCuisineList;
                            if(!(tempList.includes(cuisine))){
                                tempList.push(cuisine);
                            }
                            else{
                                tempList.splice(tempList.indexOf(cuisine),1);
                            }
                            //add update function 
                        }}
                        >{cuisine}</button>
                    )
                })}
            </ButtonGroup>


        </div>
    )
}

export default PreSetCuisines;