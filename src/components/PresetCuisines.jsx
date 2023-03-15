import {useState} from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getCuisines, updateUserCuisine, getFilters} from '../firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

function PreSetCuisines({user}) {
  
    // const [user, setUser] = useState([]);
  
    // const auth = getAuth();
    // onAuthStateChanged(auth, (user) => {
    //   if (!user.isAnonymous) {
    //     setUser(user);
    //     // User is signed in, see docs for a list of available properties
    //     // https://firebase.google.com/docs/reference/js/firebase.User
    //   } else {
    //     // User is signed out
    //     setUser(null);
    //   }
    // });

    // console.log(user);

    const [listOfCuisines, setCuisineList] = useState([]);
    const [userCuisineList, setUserCuisine] = useState([]);
    const [t, setT] = useState(false);


    // redirect on anonymous user
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

    if(!t && user && user.uid){
        //getInformation
        if(userCuisineList.length === 0){
            Promise.resolve(getFilters(user.uid)).then(val =>{
                setUserCuisine(val.filters.excludedCuisines);
            })
        }

        setT(true);
    }

    console.log(userCuisineList);
    
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