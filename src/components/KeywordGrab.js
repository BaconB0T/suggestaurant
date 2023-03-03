import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, updateGroupMember, validateUser } from '../firestore'

const KeywordGrab = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const keywordRef = useRef()
    const [error, setError] = useState("")
    const [urlString, setURL] = useState("")

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            setCookie('keywords', keywordRef.current.value, { path: '/' });

            const jsonData = {
                keywords: keywordRef.current.value,
                time: cookies["time"],
                price: cookies["price"],
                diet: cookies["diet"],
                latlong: cookies["latlong"] || null,
                groupCode: cookies["groupCode"],
                host: cookies["host"]
            }

            updateGroupMember(cookies['groupCode'], 'keywords', keywordRef.current.value);
            // object for storing and using data
            // Using useEffect for single rendering
            // Using fetch to fetch the api from
            // flask server it will be redirected to proxy
            let url = '';
            if (cookies["groupCode"] == 0)
            {
                url="http://localhost:5000/data"
                setURL("http://localhost:5000/data")
            }
            else
            {
                if(cookies["host"] == 0)
                {
                    url="http://localhost:5000/groupMode"
                    setURL("http://localhost:5000/groupMode")
                }
                else
                {
                    url="http://localhost:5000/groupMode"
                    setURL("http://localhost:5000/groupMode")
                }
            }

            fetch(urlString || url, {
                method:"POST",
                cache: "no-cache",
                headers:{
                    "content_type":"application/json",
                    'Access-Control-Allow-Origin':'*'
                },
                body:JSON.stringify(
                        jsonData
                    )
                }
            ).then(response => {
                return response.json();
            })
            .then(json => {
                setCookie("businesslist", json, { path: '/' });
                if (cookies["host"] != 0)
                {
                    navigate("/hostRoom")
                }
                if (cookies["groupCode"] != 0)
                {
                    navigate("/waitingRoom")
                }
                if (json.length == 0)
                {
                    navigate("/expandRadius");
                }
                else
                {
                    navigate("/recommendations");
                }
            })
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Keywords</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="keywords" className="mb-2">
                                    <Form.Label>Keywords</Form.Label>
                                    <Form.Control ref={keywordRef} required
                                        defaultValue={cookies["keywords"]}/>
                                </Form.Group>
                                <Button className="w-40 mt-10" type="submit">
                                    Go
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>

            </div>
        </Container >

    );
};
export default KeywordGrab;