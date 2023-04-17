import { getGroupInfo, getGroup, updateGroupHost } from "../firestore";
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import styles from '../styles/new.module.scss';


const UserWaiting = ({ globalState, setGlobalState }) => {
    // const [numUsers, setNumUsers] = useState(-1);
    // const [numUsersReady, setNumUsersReady] = useState(0);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();

    // async function updateVars() {
    //     const groupCode = cookies["groupCode"]
    //     const group = await getGroup(groupCode)
    //     async function idk() {
    //         // setNumUsers(group.numUsers)
    //         // setNumUsersReady(group.numUsersReady)
    //         // return (group.skip) || (group.numUsers == group.numUsersRead);
    //         return
    //     }
    //     // console.log('inside use effect')
    //     // console.log(group.numUsers)
    //     // console.log(group.numUsersReady)
    //     idk().then((retVal) => {
    //         console.log("ABOUT TO RUN ALGORITHM")
    //         runAlgorithm()
    //         if (group.numUsers == group.numUsers || retVal == true) {
    //             const isHost = cookies["host"] // 'true', 'false'
    //             console.log(isHost)
    //             if (!(isHost == 'true')) {
    //                 navigate("/recommendations/waiting")
    //                 return
    //             }
    //             runAlgorithm()
    //         }
    //     })
    // }
    // const MINUTE_MS = 1000;

    useEffect(() => {
        console.log("ABOUT TO RUN ALGORITHM")
        runAlgorithm()
        // const interval = setInterval(() => {
        //     updateVars()
        //     // console.log('Logs every second');
        // }, MINUTE_MS);

        // return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    async function runAlgorithm(e) {
        console.log(globalState.jsonData);
        //this is fetch code block from keywords
       //https://suggestaurantapp-3sgrjmlphq-uc.a.run.app/
       fetch("http://localhost:5000/data", {
        method: "POST",
        cache: "no-cache",
        headers: {
            "content_type": "application/json",
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(
                globalState.jsonData
            )
        }
    ).then(response => {
        return response.json();
    })
    .then(json => {
        if (typeof json != "object")
        {
            console.log(json)
            setGlobalState({...globalState, "failedToFind": json})
            navigate("/expandRadius");
        }
        else
        {
            setCookie("businesslist", json, { path: '/' });
            setGlobalState({...globalState, 'businesslist': json});
            setGlobalState({...globalState, "failedToFind": false})
            navigate("/recommendations");
        }
    })
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
                        <h3>Retrieving Your Results!
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

export default UserWaiting