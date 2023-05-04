import React, { useState, useEffect } from "react";
import { signOutUser, deleteUser, getFilters } from "../firestore";
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
  const [getuname, setuname] = useState("");

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
    Promise.resolve(getFilters(user.uid)).then(val => {
        setuname(val.username);
    });

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
                  <h1>Hello {getuname}</h1>
                  <div>Email: {user && user.email}</div>
                  <br/>

                  <div className = 'account-btn'>
                    <Button onClick={() => {navigate('/account/allergies')}}>Allergies</Button>
                  </div>
                  <div className = 'account-btn'>
                    <Button onClick={() => {navigate('/account/filters')}}>Restaurant Preferences</Button>
                  </div>
                  <div className = 'account-btn'>
                    <Button onClick={() => {navigate('/history')}}>Restaurant History</Button>
                  </div>
                  <div className = 'account-btn'>
                    <Button onClick={() => {navigate('/change-password')}}>
                     Change Password
                    </Button>
                  </div>
                  <div className = 'account-btn'>
                    <Button onClick={sOut}>Sign Out</Button>
                  </div>
                  <div className='account-btn'>
                    <Button id='del-btn' onClick={() => { setShow(true) }}>Delete Account</Button>
                  </div>
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