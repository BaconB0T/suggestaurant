import React, { useState, useEffect } from "react";
import { signOutUser, deleteUser } from "../firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Alert, Button, Form } from "react-bootstrap";


const DeleteAlert = (props) => {
  const { setShow, show, alertCallback } = props;
  
  return (
    <div style={{display: 'flex', 'justify-content': 'center'}}>
      <Alert show={show} variant="danger">
        <Alert.Heading>Account Deletion</Alert.Heading>
        <p>Are you sure you want to delete your account? This cannot be undone.</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={() => { setShow(false); alertCallback(); }}>Delete</Button>
          <Button variant="success-outline" onClick={() => { setShow(false); }}>Cancel</Button>
        </div>
      </Alert>
    </div>
  )
}

const Account = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [user, setUser] = useState([]);
  const [error, setError] = useState("")


  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
      } else {
        // User is signed out
        setUser(null);
      }
    });
  });

  if(user === null) {
    return (
        <Navigate to='/login' />
    );
  } else {
    const sOut = () => {
      signOutUser().then((res) => {
        if(res) {
          navigate('/');
        } else {
          alert("Something went wrong!");
        }
      });
    }

    async function handleSubmit(e) {
      e.preventDefault(); // don't refresh the page
      try {
          setError("")
          
          navigate("/");
      } catch (e) {
          // else set an error
          setError(e)
      }
  }
  
    return (
      <div display='block'>
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                      <DeleteAlert alertCallback={() => {deleteUser(); navigate('/login');}} show={show} setShow={setShow}></DeleteAlert>
                      <h1>Hello {user && user.username}</h1>
                      <div>Email: {user && user.email}</div>
                      <Link to='/account/allergies'>Allergies</Link>
                      <br></br>
                      <Link to='/account/filters'>Filters</Link>
                      <br></br>
                      <Link to='/history'>History</Link>
                      <br></br>
                      <button>
                      <Link to='/change-password'>Change Password</Link>
                      </button>
                      <br></br>
                      <button onClick={sOut}>Sign Out</button>
                      <br></br>
                      <button onClick={() => {setShow(true)}}>Delete Account</button>
                      <Form onSubmit={handleSubmit}>
                          <Button className="w-40 mt-10" type="submit">
                              Home
                          </Button>
                      </Form>
                      <br></br>
                      </Card.Body>
                    </Card>
                </>
            </div>
        </Container >
      </div>
    );
  }
}

export default Account