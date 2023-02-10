import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, validateUser } from '../firestore'

const KeywordGrab = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const keywordRef = useRef()
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            setCookie('keywords', keywordRef.current.value, { path: '/' });

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
                                    <Form.Control ref={keywordRef} required />
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