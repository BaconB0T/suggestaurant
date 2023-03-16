import { getGroupInfo, getGroup } from "../firestore";
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import styles from '../styles/new.module.scss';


const GroupWaiting = () => {
    const [numUsers, setNumUsers] = useState(-1);
    const [numUsersReady, setNumUsersReady] = useState(0);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();







    async function updateVars() {
        const groupCode = cookies["groupCode"]
        const group = await getGroup(groupCode)
        setNumUsers(group.numUsers)
        setNumUsersReady(group.numUsersReady)
    }
    const MINUTE_MS = 1000;

    useEffect(() => {
        const interval = setInterval(() => {
            updateVars()
            console.log('Logs every second');
        }, MINUTE_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    async function runAlgorithm() {
        console.log("WE ARE RUNNING THE ALGORITHM")
        const groupCode = cookies["groupCode"]
        console.log(groupCode)
        const jsonData = await getGroupInfo(groupCode)//run recommendation algorithm and navigate to recommendations page
        console.log("GOT GROUP INFO")
        try {
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
            })
                .then(json => {
                    setCookie("businesslist", json, { path: '/' });
                    if (json.length == 0) {
                        navigate("/expandRadius");
                    }
                    else {
                        navigate("/recommendations");
                    }
                })
        } catch (e) {
            // else set an error
            console.log(e)
        }
    }
    useEffect(() => {
        async function idk() {
            const groupCode = cookies["groupCode"]
            const group = await getGroup(groupCode)
            setNumUsers(group.numUsers)
            setNumUsersReady(group.numUsersReady)

        }

        idk().then(() => {
            if (numUsersReady == numUsers) {
                runAlgorithm()
            }
        })


    }, [numUsers, numUsersReady]);

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

                </>
            </div>
        </Container >
    </>

}

export default GroupWaiting