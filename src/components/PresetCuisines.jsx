import {useState, useEffect} from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getCuisines, updateUserCuisine, getFilters} from '../firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import "../styles/presetCuis.css";

function PreSetCuisines() {
  
    const [user, setUser] = useState([]);
  
    const auth = getAuth();
    const [listOfCuisines, setCuisineList] = useState([]);
    const [userCuisineList, setUserCuisine] = useState([]);
    const [checked, setChecked] = useState([]);
    const [t, setT] = useState(false);

    useEffect(() =>{
        onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser(user);
            Promise.resolve(getFilters(user.uid)).then(val =>{
                setUserCuisine(val.filters.excludedCuisines);
                setChecked(val.filters.excludedCuisines);
            })
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
        } else {
            // User is signed out
            setUser(null);
        }
        });
    }, []);

    // console.log(user);

    


    // if(user === null) {
    //     return (
    //         <Navigate to='/login' />
    //     );
    // }

    // if(!t && user && user.uid){
    //     //getInformation
    //     if(userCuisineList.length === 0){
    //         Promise.resolve(getFilters(user.uid)).then(val =>{
    //             setUserCuisine(val.filters.excludedCuisines);
    //         })
    //     }

    //     setT(true);
    // }

    // console.log(userCuisineList);
    
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
    
    const handleCheck = (event) => {
        var updatedList = [...checked];
        if (event.target.checked) {
            updatedList = [...checked, event.target.value];
        } else{
            updatedList.splice(checked.indexOf(event.target.value), 1);
        }
        setChecked(updatedList);
        updateUserCuisine(user.uid, updatedList);
    };


    return(
        <div>
            <h1>Select Some Cuisines</h1>
            {/* <ButtonGroup style={{flexWrap: "wrap"}}>
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
            </ButtonGroup> */}


            <div className='list-cont'>
                {listOfCuisines.map((item, index) => (
                    <div key={index} className = 'tes'>
                        <input 
                         id={'list-it' + index}
                         value = {item}
                         type='checkbox'
                         checked={checked.includes(item)}
                         onClick={handleCheck}
                        hidden/>
                        <label className = 'item-nam' for ={'list-it' + index}>{item}</label>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default PreSetCuisines;