import {useEffect, useState} from "react";
import { getFilters, setPreferences, db } from "../firestore";
import {Link, Navigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import {getDoc, doc} from "firebase/firestore";
import "./preferences.css"
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Preferences() {  
    const [user, setUser] = useState([]);

    const auth = getAuth();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
        });    
    });
    const [FamilyFriendly, setFF] = useState(false);
    const [includeHis, setHis] = useState(false);
    const [minRating, setMR] = useState(0);
    const [hover, setHover] = useState(0);
    const [FastFood, setff] = useState(false);
    const [t,setT] = useState(false);
    
    
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
        <div className = 'pref'>
            <div className = 'Title'>Preferences</div>
            <div className = 'oneline'>
                <div className="test">Include Family Friendly</div>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {FamilyFriendly} onClick = {handleFFChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
            <div className="test">Include History</div>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {includeHis} onClick = {handleIncHisChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
                <div className="test">Include Fast Food</div>
                <label className='switch'>
                    <input id = 'checkb' type = 'checkbox' checked = {FastFood} onClick = {handleFFoodChange}/>
                    <span className = 'slider' />
                </label>
            </div>

            <div className = 'oneline'>
            <div className="test">Minimum Rating</div>
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

            <div className = 'oneline'>
            <div className="test">Preselect Cuisines</div>
                <div className="but"><button><Link to='/selectCuisine'>Select Cuisine</Link></button></div>
            </div>


        </div>
    )
}

export default Preferences;