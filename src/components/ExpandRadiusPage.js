import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import {BackButton, HomeButton } from './Buttons';
import { updateGroupHost, updateGroupMember } from '../firestore';
import { useEffect } from 'react';

const ExpandRadius = ({globalState, setGlobalState}) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const distRef = useRef()
    const [reason, setReason] = useState()
    useEffect(() => {
        const gc = cookies['groupCode'];
        if (gc != '0') {
            let updatedSkip = false;
            if (!globalState.groupExpandRadiusVisited) {
                updateGroupMember(gc, 'numUsersReady', null).then((b) => updateGroupHost(gc, 'skip', false));
                updatedSkip = true;
                // Prevents decrementing numUsersReady everytime the page reloads before they expand the search radius.
                setGlobalState({
                    ...globalState,
                    groupExpandRadiusVisited: true
                });
            }
            if (!updatedSkip) { // avoid race condition
                updateGroupHost(gc, 'skip', false);
            }
            setGlobalState({...globalState, skip: false});
        }
    }, []);
    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            
            const latlong = {
                latitude: cookies["latlong"]["latitude"],
                longitude: cookies["latlong"]["longitude"],
                distance: distRef.current.value
            }

            setCookie('latlong', latlong, { path: '/' });
            if (cookies['groupCode'] != 0 && cookies['host'] === 'true') {
                updateGroupHost(cookies['groupCode'], 'latlong', latlong);
            }

            // They've submitted the form, allow decNumUsersReady again.
            setGlobalState({
                ...globalState,
                groupExpandRadiusVisited: false
            });
            navigate("/keywordGrab");

        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    function renderSwitch() 
    {
        if (globalState.failedToFind != false)
        {
            console.log(globalState.failedToFind)
            switch(globalState.failedToFind){
                case "1":
                    return (<h2 className="text-center mb-4">No Matches In Your Area!</h2>)
                case "2":
                    return (<h2 className="text-center mb-4">No Matches At Your Price!</h2>)
                case "3":
                    return (<h2 className="text-center mb-4">No Matches At Your Times!</h2>)
                case "4":
                    return (<h2 className="text-center mb-4">No Matches<br></br>With Your Allergy Restrictions!</h2>)
                case "5":
                    return (<h2 className="text-center mb-4">No Matches<br></br>With Your Preferences!</h2>)
                default:
                    return (<h2 className="text-center mb-4">No Matches In Your Area!</h2>)
            }
        }
        else
        {
            return (<></>)
        }
    }
    
    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <BackButton to='/keywordGrab'/>
            <HomeButton/>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            {renderSwitch()}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="distance" className="mb-2">
                                    <Form.FloatingLabel label="Distance in Miles">
                                        <Form.Control
                                            ref={distRef} required
                                            defaultValue={cookies["latlong"]["distance"]}
                                            placeholder="Miles"
                                        />
                                    </Form.FloatingLabel>
                                </Form.Group>
                                <Button className="w-40 mt-10 button-control" type="submit">
                                    Expand Radius?
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container>

    );
};
export default ExpandRadius;