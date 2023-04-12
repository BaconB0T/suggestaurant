import { getGroupInfo, getGroup, updateGroupHost } from "../firestore";
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import styles from '../styles/new.module.scss';


const GroupWaiting = ({setGlobalState}) => {
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
            return (group.hostReady) || (group.numUsers == group.numUsersReady);
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
            // console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    async function runAlgorithm(e) {
        e && e.preventDefault();
        navigate("/recommendations/waiting")
        const groupCode = cookies["groupCode"]
        updateGroupHost(groupCode, "hostReady", true)
        const jsonData = await getGroupInfo(groupCode)  //run recommendation algorithm and navigate to recommendations page
        try {
            console.log('inside try catch');
            fetch("http://localhost:5000/data", {
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
                    json.sort();
                    setCookie("businesslist", json, { path: '/' })
                    setGlobalState({businesslist: json});
                    if (json.length == 0) {
                        navigate("/expandRadius");
                    }
                    else {
                        navigate("/recommendations");
                    }
                })
        } catch (e) {
            // else set an error
            console.err(e)
        }
    }

    // useEffect(() => {
    //     if (numUsersReady == numUsers) {
    //        runAlgorithm()
    //     }
    // }, [numUsersReady, numUsers])





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
                        (<Form onSubmit={runAlgorithm}>  
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