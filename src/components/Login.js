import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { signInEmailPassword, getAccount, signInWithGoogle } from '../firestore'

const Login = () => {
    const navigate = useNavigate();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        setError("");
        const username=usernameRef.current.value;
        getAccount('username', username).then((acc) => {
            const email = (acc && acc.email) || username
            signInEmailPassword(email, passwordRef.current.value)
                .then(({bool, idOrCode}) => {
                    if (bool) {
                        navigate("/account");
                    } else {
                        setError("Invalid username (or email) and password combination.");
                    }
            });
        });
    }

    async function providerSignIn(provider) {
        const supportedProviders = ['google'];
        var result = '';
        switch (provider) {
            case 'google':
                result = await signInWithGoogle();
                break;
            default:
                console.error(`Invalid provider: ${provider}. Supported providers are: ${supportedProviders}`)
        }
        // console.log(result);
        if(result) {
            navigate('/account');
        }
    }

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Login</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="username" className="mb-2">
                                <Form.Label>Username</Form.Label>
                                <Form.Control ref={usernameRef} required />
                            </Form.Group>
                            <Form.Group id="password" className="mb-2">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" ref={passwordRef} required />
                            </Form.Group>
                            <Button className="w-40 mt-10" type="submit">
                                Login
                            </Button>
                        </Form>
                      <button onClick={() => providerSignIn('google')}>Sign in with Google</button>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Need an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </Container >

    );
};
export default Login;
