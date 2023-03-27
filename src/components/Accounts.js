import React, { useState, useEffect } from "react";
import { signOutUser, deleteUser } from "../firestore";
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Alert, Button, Form } from "react-bootstrap";
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import CustomAlert from "./CustomAlert";

const Account = ({ user }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  // const [user, setUser] = useState([]);
  const [error, setError] = useState("");
  console.log("In Accounts.js user");
  console.log(user);
  // const auth = getAuth();
  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     console.log('In onAuthStateChanged');
  //     console.log(user);
  //     if (!user.isAnonymous) {
  //       setUser(user);
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/firebase.User
  //     } else {
  //       // User is signed out
  //       setUser(null);
  //     }
  //   });
  // });

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

    async function handleClickBack() {
        try {
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
          <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => handleClickBack()}/>
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
                  <button onClick={() => { setShow(true) }}>Delete Account</button>
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