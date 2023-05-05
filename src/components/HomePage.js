import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Popup from './Popup';
import { getFilters, getHistory, getLastVisitedRestaurant, hasDietaryRestrictions, rateRestaurant, setLastVisitedRestaurant } from "../firestore.js";
import logo from './../images/logo.png'; // Tell webpack this JS file uses this image
import { AccountOrLoginButton } from './Buttons';
import { useGeolocated } from "react-geolocated";


const HomePage = ({ bob, setGlobalState, globalState }) => {
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [loginOrAccount, setLoginOrAccount] = useState("Login")

    const [lastVisitedRestaurant, setStateLastVisitedRestaurant] = useState(null);

    // For "I'm Feeling Lucky!"
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

    useEffect(() => {
        setLoginOrAccount(<AccountOrLoginButton isAnonymous={bob.isAnonymous} />)
        setCookie("time", "false", { path: '/' })
        setCookie("price", "false", { path: '/' })
        const dietData = {
            'Dairy-free': "false",
            'Gluten-free': "false",
            'Halal': "false",
            'Kosher': "false",
            'Soy-free': "false",
            'Vegan': "false",
            'Vegetarian': "false"
        }
        setCookie('diet', dietData, { path: '/' });
        setCookie("latlong", "false", { path: '/' })
        setCookie("keywords", "false", { path: '/' })
    }, [bob]);

    function notInGroup() {
        setCookie('groupCode', 0, { path: '/' });
        setCookie('host', false, { path: '/' });
    }

    async function handleClickQuiz() {
        try {
            notInGroup();
            navigate("/location");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickQuiz2() {
        try {
            setCookie('host', true, { path: '/' });
            navigate("/group/host");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickQuiz3() {
        try {
            setCookie('host', false, { path: '/' });
            navigate("/group/join");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    if (!bob.isAnonymous && bob.uid) {
        Promise.resolve(getLastVisitedRestaurant(bob.uid)).then(result => {
            setStateLastVisitedRestaurant(result);
        });
    };

    const addRestToHistory = (rating_num) => {
        console.log("ADD REST TO HISTORY")
        rateRestaurant(lastVisitedRestaurant, rating_num, bob.uid);
        setLastVisitedRestaurant(bob.uid, null)

    };

    const onPopupClose = () => {
        console.log("CLOSE POPUP")
        setLastVisitedRestaurant(bob.uid, null)
    };

    async function randomSuggestion() {
        if (!isGeolocationAvailable) {
            console.error("Failed to get current location: Location not available!");
            return;
        }
        if (!isGeolocationEnabled) {
            console.error("Failed to get current location: Location disabled!");
            return;
        }
        if(!coords) {
            console.error("Failed to get current location: Coordinates unavailable!");
            return;
        }
        
        notInGroup();
        console.log(JSON.stringify(await makeJSONData(await getFilters(bob.uid))));
        const jsonData = await makeJSONData(await getFilters(bob.uid));

        setGlobalState({...globalState, jsonData: jsonData});
        navigate('/waiting');
    }

    async function makeJSONData(userData) {
        const latlong = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            distance: 250,
        }
        let dietData = {
            'Dairy-free':  '',
            'Gluten-free': '',
            'Halal':       '',
            'Kosher':      '',
            'Soy-free':    '',
            'Vegan':       '',
            'Vegetarian':  ''
        };
        if(userData && userData['filters']['dietaryRestrictions'].length !== 0) {
            const diet = dietData['filters']['dietaryRestrictions'];
            dietData = {
                'Dairy-free':   !diet.includes("Dairy-free")    ? "" : "dairy",
                'Gluten-free':  !diet.includes("Gluten-free")   ? "" : "gluten",
                'Halal':        !diet.includes("Halal")         ? "" : "halal",
                'Kosher':       !diet.includes("Kosher")        ? "" : "kosher",
                'Soy-free':     !diet.includes("Soy-free")      ? "" : "soy",
                'Vegan':        !diet.includes("Vegan")         ? "" : "vegan",
                'Vegetarian':   !diet.includes("Vegetarian")    ? "" : "veggie"
            }
        }
        const currentDate = new Date();
        const zeroFilledHours = ('00'+currentDate.getHours()).slice(-2);
        const zeroFilledMinutes = ('00'+currentDate.getMinutes()).slice(-2);

        const filterInfo = bob.isAnonymous ? false : userData.filters;
        const userInfo =  filterInfo === false ? false : {
            fastFood: filterInfo.preferences.includeFastFood,
            exclude: filterInfo.excludedCuisines,
            includeHistory: !filterInfo.preferences.includeHistory ? false : Object.keys(getHistory(filterInfo)),
            minRating: filterInfo.preferences.minimumRating,
            familyFriendly: filterInfo.preferences.requireFamilyFriendly
        };
        return {
            random: true,
            time: `${zeroFilledHours}:${zeroFilledMinutes}`,
            price: 5,
            diet: dietData,
            latlong: latlong,
            userinfo: userInfo,
            keywords: "" // Required for the server, not for random suggestions.
        }
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            {loginOrAccount}
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>

                <div>

                    {lastVisitedRestaurant && <Popup
                        content={<>
                            <b>How was {lastVisitedRestaurant.name}?</b>
                            <br></br>
                            <br></br>
                            <button onClick={() => addRestToHistory(1)}>👍</button>  <button onClick={() => addRestToHistory(-1)}>👎</button>

                        </>}
                        onClose={onPopupClose}
                    />}
                </div>
                <>
                    {/* <Card className = "card-control">
                        <Card.Body> */}
                    <img src={logo} className="image-control" alt="Logo" />
                    <h2 className="text-center mb-4">Suggestaurant</h2>
                    <Button className="w-75 button-control" onClick={() => handleClickQuiz()}>
                        Start Quiz
                    </Button>
                    <br></br>
                    <br></br>
                    <Button className="w-75 button-control" onClick={() => handleClickQuiz2()}>
                        Host Group Quiz
                    </Button>
                    <br></br>
                    <br></br>
                    <Button className="w-75 button-control" onClick={() => handleClickQuiz3()}>
                        Join Group Quiz
                    </Button>
                    <br></br>
                    <br></br>
                    <Button className="w-75 button-control" onClick={() => randomSuggestion()}>
                        I'm Feeling Lucky!
                    </Button>
                </>

            </div>
        </Container >
    )
}

export default HomePage;