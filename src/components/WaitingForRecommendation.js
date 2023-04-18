import { getGroup, updateGroupMember } from "../firestore";
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner';
import { Container } from 'react-bootstrap'

const WaitingForRecommendation = (props) => {
    const { setGlobalState, globalState } = props;
    const message = props.message ? props.message : "Retrieving Your Results!";
    const [numUsers, setNumUsers] = useState(-1);
    const [numUsersReady, setNumUsersReady] = useState(0);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();

    const MINUTE_MS = 1000;

    async function idk() {
        const groupCode = cookies["groupCode"]
        const group = await getGroup(groupCode)
        // console.log(group.suggestions)
        // console.log(Object.keys(group.suggestions))
        return group
    }

    async function checkGroupDone() {
        await idk().then((group) => {
            // if Not skipped and group not all ready, go back.
            const skipped = cookies['host'] === 'true' ? globalState.skip : group['skip']
            if (group && (!skipped && group['numUsers'] !== group['numUsersReady'])) {
                console.log(group);
                updateGroupMember(group['groupCode'], 'numUsersReady', null).then((b) => {
                    navigate('/keywordGrab');
                });
            } else if (group && group["haveSuggestions"]) {
                // Host might be getting a new set of recommendations. Wait for those instead!
                let suggestions = Object.keys(group.suggestions);
                suggestions.sort();
                console.log(suggestions);
                setCookie('businesslist', suggestions, { path: '/' });
                setGlobalState({...globalState, businesslist: suggestions});
                navigate("/recommendations");
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
                        <h3>{message}</h3>
                        <br></br>
                        <div>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>

                    </div>

                    <br></br>

                    {/* {(cookies["host"] === "true") ? 
                        (<Form onSubmit={handleSubmit}>  
                            <Button className="w-50 mt-10 button-control" type="submit">
                                continue anyway
                            </Button>
                        </Form>) : <></>
                    } */}
                </>
            </div>

        </Container >
    </>

}

export default WaitingForRecommendation
