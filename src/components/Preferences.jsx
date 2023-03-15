import {useEffect, useState} from "react";
import { getFilters, setPreferences, db } from "../firestore";
import {Link, Navigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import {getDoc, doc} from "firebase/firestore";
import "./preferences.css"
// import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Preferences({user}) {  
    // const [user, setUser] = useState([]);

    // const auth = getAuth();
    // useEffect(() => {
    //     onAuthStateChanged(auth, (user) => {
    //         if(!user.isAnonymous) {
    //             setUser(user);
    //         } else {
    //             setUser(null);
    //         }
    //     });    
    // });
    
    const [FamilyFriendly, setFF] = useState(false);
    const [includeHis, setHis] = useState(false);
    const [minRating, setMR] = useState(0);
    const [hover, setHover] = useState(0);
    const [FastFood, setff] = useState(false);
    const [t,setT] = useState(false);
    
    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }
    
    if(!t && user && user.uid){
        console.log(user);
        console.log(user.uid);
        Promise.resolve(getFilters(user.uid)).then(val => {
            setFF(val.filters.preferences.requireFamilyFriendly);
            setHis(val.filters.preferences.includeHistory);
            setMR(val.filters.preferences.minimumRating);
            setff(val.filters.preferences.includeFastFood);
        });
    };
    
    const handleFFChange = () => {
        setFF(!FamilyFriendly);
        setT(true);
        setPreferences(user.uid, !FamilyFriendly, includeHis, FastFood, minRating);
    };
    const handleIncHisChange = () => {
        setHis(!includeHis);
        setT(true);
        setPreferences(user.uid, FamilyFriendly, !includeHis, FastFood, minRating);
    };

    const handleFFoodChange = () => {
        setff(!FastFood);
        setT(true);
        setPreferences(user.uid, FamilyFriendly, includeHis, !FastFood, minRating);
    };


    return(
        <div>
            <h1>Preferences</h1>
            <div className = 'oneline'>
                <h4>Include Family Friendly</h4>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {FamilyFriendly} onClick = {handleFFChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
                <h4>Include History</h4>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {includeHis} onClick = {handleIncHisChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
                <h4>Include Fast Food</h4>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {FastFood} onClick = {handleFFoodChange}/>
                    <span className = 'slider' />
                </label>
            </div>

            <div className = 'oneline'>
                <h4>Minimum Rating</h4>
                <div className = 'star-rating'>
                    {[...Array(5)].map((star,index) => {
                        index += 1;
                        return (
                            <button 
                                id = 'starSelector'
                                type = 'button' 
                                key={index} 
                                className = {index <= (hover || minRating) ? 'on' : 'off'} 
                                onClick = {() => {
                                    setMR(index); 
                                    setT(true);
                                    setPreferences(user.uid, FamilyFriendly, includeHis, FastFood, index);
                                    }
                                }
                                onMouseEnter = {() => {setHover(index); setT(true);}}
                                onMouseLeave = {() => {setHover(minRating); setT(true);}}
                            >
                                <span className = "star">&#9733;</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <h4>Preselect Cuisines</h4>
                <button><Link to='/selectCuisine'>Select Cuisine</Link></button>
            </div>


        </div>
    )
}

export default Preferences;