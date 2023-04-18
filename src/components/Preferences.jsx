import { useState } from "react";
import { getFilters, setPreferences, db } from "../firestore";
import { useNavigate, Link, Navigate } from 'react-router-dom';
import "./preferences.css";
import { Container, Card, Button } from "react-bootstrap";
import Popup from './Popup';
import { BackButton, HomeButton } from "./Buttons";

function Preferences({ user, setGlobalState, updated }) {

    const [FamilyFriendly, setFF] = useState(false);
    const [includeHis, setHis] = useState(false);
    const [minRating, setMR] = useState(0);
    const [hover, setHover] = useState(0);
    const [FastFood, setff] = useState(false);
    const [t, setT] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState("")

    // redirect on anonymous user.
    if (user === null || user.isAnonymous) {
        return (
            <Navigate to='/login' />
        );
    }

    if (!t && user && user.uid) {
        // console.log(user);
        // console.log(user.uid);
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

    const closePopup = () => {
        setGlobalState({ "updated": false })
        console.log("CLOSE POPUP")
    };

    return (
        <div>
            <Container
                className="d-flex align-items-center justify-content-center overflow-auto"
                style={{ minHeight: "100vh" }}
            >
                <BackButton to='/account' />
                <HomeButton/>
                <div>
                    {updated && <Popup
                        content={<>
                            <div>Cuisines Updated!</div>
                        </>}
                        onClose={closePopup}
                    />}
                    <h3>Preferences</h3>
                    <Card className="w-100">
                        <Card.Body>
                            <div className='oneline'>
                                <div className="test">Only Family Friendly Restaurants</div>
                                <div id='toggle'>
                                    <label className='switch'>
                                        <input id='checkb' type='checkbox' checked={FamilyFriendly} onClick={handleFFChange} />
                                        <span className='slider' />
                                    </label>
                                </div>
                            </div>
                            <div className='oneline'>
                                <div className="test">Exclude Visited Restaurants</div>
                                <div id='toggle'>
                                    <label className='switch'>
                                        <input id='checkb' type='checkbox' checked={includeHis} onClick={handleIncHisChange} />
                                        <span className='slider' />
                                    </label>
                                </div>
                            </div>
                            <div className='oneline'>
                                <div className="test">No Fast Food</div>
                                <div id='toggle'>
                                    <label className='switch'>
                                        <input id='checkb' type='checkbox' checked={FastFood} onClick={handleFFoodChange} />
                                        <span className='slider' />
                                    </label>
                                </div>
                            </div>

                            <div className='oneline'>
                                <div className="test">Minimum Rating</div>
                                <div className='star-rating'>
                                    {[...Array(5)].map((star, index) => {
                                        index += 1;
                                        return (
                                            <button
                                                id='starSelector'
                                                type='button'
                                                key={index}
                                                className={index <= (hover || minRating) ? 'on' : 'off'}
                                                onClick={() => {
                                                    setMR(index);
                                                    setT(true);
                                                    setPreferences(user.uid, FamilyFriendly, includeHis, FastFood, index);
                                                }
                                                }
                                                onMouseEnter={() => { setHover(index); setT(true); }}
                                                onMouseLeave={() => { setHover(minRating); setT(true); }}
                                            >
                                                <span className="star">&#9733;</span>
                                            </button> 
                                        );
                                    })} 
                                    <div>& Up</div>
                                </div>
                            </div>


                            <div className='oneline'>
                                <div className="test">Exclude Cuisines</div>
                                <div className="but"><Button><Link to='/selectCuisine' className='button-info'>Select Cuisines</Link></Button></div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    )
}

export default Preferences;