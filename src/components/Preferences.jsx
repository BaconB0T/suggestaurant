import {useEffect, useState} from "react";
import { auth, getFilters, setPreferences, db } from "../firestore"
import { useCookies } from 'react-cookie';
import {getDoc, doc} from "firebase/firestore";
import "./preferences.css"

function Preferences(){
    const user = auth.currentUser;

    const [FamilyFriendly, setFF] = useState(false);
    const [includeHis, setHis] = useState(false);
    const [minRating, setMR] = useState(0);
    const [hover, setHover] = useState(0);
    const [FastFood, setff] = useState(false);

    const [t,setT] = useState(false);
    if (!t){
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
                    <input type = 'checkbox' checked = {FamilyFriendly} onClick = {handleFFChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
                <h4>Include History</h4>
                <label className='switch'>
                    <input type = 'checkbox' checked = {includeHis} onClick = {handleIncHisChange}/>
                    <span className = 'slider' />
                </label>
            </div>
            <div className = 'oneline'>
                <h4>Include Fast Food</h4>
                <label className='switch'>
                    <input type = 'checkbox' checked = {FastFood} onClick = {handleFFoodChange}/>
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


        </div>
    )
}

export default Preferences;