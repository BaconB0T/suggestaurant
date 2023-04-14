import React, { useState, useEffect } from "react";
import { signOutUser, deleteUser } from "../firestore";
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Alert, Button, Form } from "react-bootstrap";
import CustomAlert from "./CustomAlert";
import { BackButton } from './Buttons';
import '../styles/Accounts.css';

const Account = ({ user }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  // redirect on anonymous user
  if (user === null || user.isAnonymous) {
    return (
      <Navigate to='/login' />
    );
  } else {
    const sOut = () => {
      signOutUser().then((res) => {
        if (res) {
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

    console.log(user.username);

    return (
      <div display='block'>
        <Container
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}
        >
          <BackButton to='/'/>
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <>
              <Card>
                <Card.Body>
                  {/*   const { buttons } */}
                  <CustomAlert
                    alertHeading='Delete Account' 
                    alertMessage="Are you sure you want to delete your account? This cannot be undone." 
                    alertVariant='danger' 
                    show={show}
                    setShow={setShow}
                    buttons={[['outline-danger', () => { deleteUser(); navigate('/login'); }, 'Delete'],
                              ['success-outline', () => {}, 'Cancel']]}>
                  </CustomAlert>
                  <h1>Hello {user && user.username}</h1>
                  <div>Email: {user && user.email}</div>

                  <div id = 'btn'>
                    <Button><Link to='/account/allergies' id='button-info'>Allergies</Link></Button>
                  </div>
                  <div id = 'btn'>
                    <Button><Link to='/account/filters' id='button-info'>Restaurant Preferences</Link></Button>
                  </div>
                  <div id = 'btn'>
                    <Button><Link to='/history' id='button-info'>Restaurant History</Link></Button>
                  </div>
                  <div id = 'btn'>
                    <Button>
                      <Link to='/change-password' id='button-info'>Change Password</Link>
                    </Button>
                  </div>
                  <div id = 'btn'>
                    <Button id = 'btn' onClick={sOut}>Sign Out</Button>
                  </div>
                  <div id='btn'>
                    <Button id='del-btn' onClick={() => { setShow(true) }}>Delete Account</Button>
                  </div>
                  <Form onSubmit={handleSubmit}>
                    <div id='btn'>
                      <Button className="w-40 mt-10" type="submit">
                        Home
                      </Button>
                    </div>
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