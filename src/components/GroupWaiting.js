import { getGroupInfo, getGroup, updateGroupHost } from "../firestore";
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import styles from '../styles/new.module.scss';


const GroupWaiting = ({globalState, setGlobalState}) => {
    const [numUsers, setNumUsers] = useState(-1);
    const [numUsersReady, setNumUsersReady] = useState(0);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();

    async function updateVars() {
        const groupCode = cookies["groupCode"];
        const group = await getGroup(groupCode);
        async function detectGroupDone() {
            setNumUsers(group.numUsers);
            setNumUsersReady(group.numUsersReady);
            return (group.skip) || (group.numUsers == group.numUsersReady);
        }
        detectGroupDone().then((groupReady) => {
            if (groupReady) {
                const isHost = cookies["host"]; // 'true', 'false'
                if(!(isHost == 'true'))
                {
                    navigate("/recommendations/waiting");
                    return;
                }
                runAlgorithm();
            }
        });
    }
    const MINUTE_MS = 1000;

    useEffect(() => {
        const interval = setInterval(() => {
            updateVars()
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    async function runAlgorithm(e) {
        e && e.preventDefault();
        const groupCode = cookies["groupCode"]
        // Maybe move to last and put the try catch in a .then()
        updateGroupHost(groupCode, "haveSuggestions", false);
        
        const jsonData = await getGroupInfo(groupCode)  //run recommendation algorithm and navigate to recommendations page
        jsonData['latlong'] = cookies['latlong'];
        navigate("/recommendations/waiting");
        try {
            console.log('inside try catch');
            fetch("https://suggestaurantapp-3sgrjmlphq-uc.a.run.app/data", {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "content_type": "application/json",
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(
                    jsonData
                )
            }
            ).then(response => {
                return response.json();
            }).then(json => {
                if (typeof json != "object")
                {
                    setGlobalState({...globalState, "failedToFind": json})
                    navigate("/expandRadius");
                }
                else
                {
                    updateGroupHost(groupCode, "haveSuggestions", true)
                    .then((b) => getGroup(groupCode))
                    .then((group) => {
                        const suggestions = Object.keys(group.suggestions);
                        setCookie("businesslist", suggestions, { path: '/' });
                        setGlobalState(prevState => ({
                            ...prevState, 
                            'businesslist': suggestions,
                            "failedToFind": false
                        }));
                        navigate("/recommendations");
                    });
                }
            });
        } catch (e) {
            // else set an error
            console.error(e)
        }
    }

    // useEffect(() => {
    //     if (numUsersReady == numUsers) {
    //        runAlgorithm()
    //     }
    // }, [numUsersReady, numUsers])

    function skipRemainingQuizzes(e) {
        e.preventDefault();
        updateGroupHost(cookies['groupCode'], 'skip', true).then((b) => {
            setGlobalState({...globalState, skip: true});
            runAlgorithm();
        });
    }



    return <>


        {/* <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
        numUsers is {numUsers} and numUsersReady is {numUsersReady} */}

        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px", marginTop: "-5px" }}>
                {/* <Card className="card-control w-75 center">
                <Card.Body> */}

                {/* </Card.Body>
            </Card> */}
                <br></br><br></br>

                <>
                    <div>
                        <h3>There are {numUsersReady} out of {numUsers} quizzes still in progress!
                        </h3>
                        <br></br>
                        <div>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>

                    </div>
                   
                    <br></br>
                    
                    {(cookies["host"] === "true") ? 
                        (<Form onSubmit={skipRemainingQuizzes}>  
                            <Button className="w-50 mt-10 button-control" type="submit">
                                continue anyway
                            </Button>
                        </Form>) : <></>
                    }
                </>
            </div>

        </Container >
    </>

}

export default GroupWaiting