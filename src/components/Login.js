import React, { useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, validateUser } from '../firestore'

const Login = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const usernameRef = useRef()
    const passwordRef = useRef()
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            // if successful login...
            if (await validateUser(usernameRef.current.value, passwordRef.current.value) === false) {
                console.log("UNSUCCSSFUL");
                throw ("Invalid username and password combination!");
            }
            const user = await getAccount("username", usernameRef.current.value);
            console.log(user);
            console.log(user.id);

            console.log("SUCCESS");

            setCookie('Name', usernameRef.current.value, { path: '/' });
            setCookie('id', user.id, { path: '/' });
            setCookie('Password', passwordRef.current.value, { path: '/' });
            navigate("/accounts");
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
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">
                        Need an account? <Link to="/accounts">Sign Up</Link>
                    </div>
                </>

            </div>
        </Container >

    );
};
export default Login;


/*


        <div>
            <h1>Login</h1>
            <h1>Name of the user:</h1>
            <input
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <h1>Password of the user:</h1>
            <input
                type="password"
                placeholder="name"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
            />
            <div>
                <button onClick={handleClick}>Set Cookie</button>
            </div>
        </div>

*/