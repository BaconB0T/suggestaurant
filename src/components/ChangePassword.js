import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { changePassword, auth } from '../firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRef, useState } from 'react'

const ChangePassword = () => {
    const navigate = useNavigate();
    const passRef = useRef();
    const confPassRef = useRef();
    const [error, setError] = useState("");

    if(auth.currentUser === null) {
        return (
            <Navigate to='/login' />
        );
    } else {
        async function handleSubmit(e) {
            e.preventDefault(); // don't refresh the page
            setError("");
            const pass = passRef.current.value
            const cpass = confPassRef.current.value
            if(pass !== cpass) {
                alert("Passwords do not match!");
                setError("Passwords do not match!");
            } else {
                changePassword(pass);
                console.log("Password changed!");
                alert("Password successfully changed!");
                navigate('/accounts');
            }
        }
        function check() {
            const pass = passRef.current.value
            const cpass = confPassRef.current.value
            pass !== cpass ? setError("Passwords do not match!") : setError('');
            // if (pass !== cpass) {
            //     setError("Passwords do not match!");
            // } else {
            //     setError('');
            // }
          }
    
        return (
            <Container
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "100vh" }}>
                <div className="w-100" style={{ maxWidth: "400px" }}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Change Your Password</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="password" className="mb-2">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control onKeyUp={check} type="password" minLength="8" ref={passRef} required />
                                </Form.Group>
                                <Form.Group id="confirm_password" className="mb-2">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control onKeyUp={check} type="password" minLength="8" ref={confPassRef} required />
                                </Form.Group>
                                <Button className="w-40 mt-10" type="submit">
                                    Change Password
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        );
    }
}

export default ChangePassword;