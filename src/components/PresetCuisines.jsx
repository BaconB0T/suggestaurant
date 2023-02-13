import {useState} from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getCuisines, updateUserCuisine, getFilters} from '../firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function PreSetCuisines() {
  
    const [user, setUser] = useState([]);
  
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
      } else {
        // User is signed out
        setUser(null);
      }
    });
    const [listOfCuisines, setCuisineList] = useState([]);
    const [userCuisineList, setUserCuisine] = useState([]);
    const [t, setT] = useState(false);

    if(!t){
        //getInformation
        Promise.resolve(getFilters(user.uid)).then(val =>{
            setUserCuisine(val.filters.excludedCuisines);
        })

        setT(true);
    }
    
    if(listOfCuisines.length === 0){
        console.log('reached');
        Promise.resolve(getCuisines()).then(val =>{
            let test = [];
                for(let i = 0; i<val.length; i++){
                    test.push(val[i].name);
                }
                setCuisineList(test);
        })
    }

    // console.log(listOfCuisines);
    
    


    return(
        <div>
            <h1>Select Some Cuisines</h1>
            <ButtonGroup style={{flexWrap: "wrap"}}>
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
                            updateUserCuisine(user.uid, tempList);
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