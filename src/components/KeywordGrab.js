import React, { useRef, useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { updateGroupMember, getGroup, getFilters, getHistory } from '../firestore'
import image from './../images/Restaurant.png'; // Tell webpack this JS file uses this image
import { BackButton, HomeButton } from './Buttons';


const KeywordGrab = ({setGlobalState, user, globalState}) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const keywordRef = useRef()
    const [error, setError] = useState("")
    const MINUTE_MS = 1000;

    async function idk() {
        const groupCode = cookies["groupCode"]
        if (groupCode != 0)
        {
            const group = await getGroup(groupCode)
            if (group && group["skip"] != undefined)
            {
                return group.skip
            }
            else
            {
                return false
            }
        }
    }

    async function checkGroupDone() {
        idk().then((retVal) => {
            if (retVal == true) {
                navigate("/recommendations/waiting")
                return
            }
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            checkGroupDone()
            // console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    async function stub()
    {
        console.log("Can't believe this works.")
        return 0
    }

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")

            setCookie('keywords', keywordRef.current.value, { path: '/' });

            const check = user.isAnonymous ? stub().then(e => {
                console.log("Check123")
                const jsonData = {
                    keywords: keywordRef.current.value,
                    time: cookies["time"],
                    price: cookies["price"],
                    diet: cookies["diet"],
                    latlong: cookies["latlong"] || null,
                    groupCode: cookies["groupCode"],
                    host: cookies["host"],
                    userinfo: false
                }
                setGlobalState({...globalState,jsonData: jsonData});
                
                if (cookies["groupCode"] != 0)
                {
                    updateGroupMember(cookies['groupCode'], 'keywords', keywordRef.current.value);
                    navigate("/group/waiting")
                }else {
                    navigate("/waiting")
                    return
                }

            }) : getFilters(user.uid).then(val => {

                console.log("Check123")
                const filterInfo = val.filters

                const userinfo = user.isAnonymous ? false : {
                    fastFood: filterInfo.preferences.includeFastFood,
                    exclude: filterInfo.excludedCuisines,
                    includeHistory: !filterInfo.preferences.includeHistory ? false : Object.keys(getHistory(val)),
                    minRating: filterInfo.preferences.minimumRating,
                    familyFriendly: filterInfo.preferences.requireFamilyFriendly
                }
                
                const jsonData = {
                    keywords: keywordRef.current.value,
                    time: cookies["time"],
                    price: cookies["price"],
                    diet: cookies["diet"],
                    latlong: cookies["latlong"] || null,
                    groupCode: cookies["groupCode"],
                    host: cookies["host"],
                    userinfo: userinfo
                }

                setGlobalState({...globalState,jsonData: jsonData});

                if (cookies["groupCode"] != 0)
                {
                    updateGroupMember(cookies['groupCode'], 'keywords', keywordRef.current.value);
                    navigate("/group/waiting")
                }else {
                    navigate("/waiting")
                    return
                }

            })
    
        } catch (e) {
            // else set an error
            console.error(e);
            setError("Uh oh, Please try again later!");
        }
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
            <img src={image} className="image-control" alt="Logo" />
            <BackButton to='/priceCheck'/>
            <HomeButton/>
                <>
                    {/* <Card className = "card-control">
                        <Card.Body> */}
                            <h3 className="text-center mb-4">Tell us what <br></br> you're looking for!</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit} className="w-75 center">
                                <Form.Group id="keywords" className="mb-2" controlId="exampleForm.ControlTextarea1">
                                    <Form.Control ref={keywordRef} required
                                        as="textarea" 
                                        placeholder="Examples: spicy local italian wine desserts"
                                        defaultValue={cookies["keywords"] != "false" ? cookies["keywords"] : null}
                                        rows={3}/>
                                </Form.Group>
                                <Button className="w-75 mt-10 button-control" type="submit">
                                    Find Restaurant
                                </Button>
                            </Form>
                        {/* </Card.Body>
                    </Card> */}
                </>

            </div>
        </Container >

    );
};
export default KeywordGrab;