import { getAuth } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { groupExists, createGroup, getCode, joinGroup } from '../firestore';
import { BackButton, CopyButton } from "./Buttons";


const Member = ({ globalState, setGlobalState }) => {
  const groupCodeRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cookies, setCookie] = useCookies(['user']);
  const [variant, setVariant] = useState("danger");

  async function handleSubmit(e) {
    e.preventDefault(); // don't refresh the page
    setError('');
    const code = groupCodeRef.current.value;
    // errors are set inside of validateForm;
    if (validateForm(code)) {
      groupExists(code).then((val) => {
        if (val) {
          // Group exists, confirmation popup.
          // Then join it.
          joinGroup(code, getAuth().currentUser).then(joined => {
            if(joined) {
              setGlobalState(prevState => ({
                ...prevState,
                showGroupJoinPopup: true
              }));
              setCookie('groupCode', code, { path: '/' });
              navigate("/dietaryRestrictions");
            } else {
              setError('Failed to join group!');
            }
          });
        } else {
          // Group doesn't exist.
          setError("Invalid code: Group doesn't exist.");
        }
      });
    }
  }
  
  function validateForm(code) {
    setVariant('danger');
    setError('');
    if (typeof code != 'string' || code.match(/^[0-9]{6}$/) == null) {
      setError(`Invalid code: ${code}. Code must have 6 digits and only contain numbers.`);
      return false;
    }
    return true;
  }

  function handleChange(event) {
    const value = event.target.value;
    if (value.length !== 6) {
      setVariant('warning');
      setError('Code must be 6 digits long.')
    } else {
      setVariant('danger');
      setError('')
    }
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <BackButton to='/' />
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Join Group</h2>
            {error && <Alert variant={variant || "danger"}>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="keywords" className="mb-2">
                <Form.Label>Enter Group Code</Form.Label>
                <Form.Control name='code' ref={groupCodeRef} 
                  onChange={handleChange} minLength="6" maxLength="6" 
                  placeholder='Group code' required 
                />
              </Form.Group>
              <Button className="w-40 mt-10" type="submit">Join</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

// Idea: We lift location and time out of the quiz just for this part, so the
// host sets these before they create the group and can then get a sort of 
// confirmation for it.
const Host = ({ setGlobalState }) => {
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();
  const groupCodeRef = useRef("Waiting...");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    getCode().then((code) => {
      setCode(code);
      groupCodeRef.current = code;
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault(); // don't refresh the page
    setError('');
    // errors are set inside of validateForm;
    if (validateForm(code)) {
      groupExists(code).then((val) => {
        if (val) {
          console.log("Group code already taken");
          setError('That code is already taken.');
        } else {
          // Try to make group with that code.
          createGroup(code).then((group) => {
            if (group === null) {
              setError('Failed to create the Group, please try again later.');
            } else {
              setCookie('groupCode', code, { path: '/' });
              joinGroup(code, getAuth().currentUser); 
              setGlobalState(prevState => ({
                ...prevState,
                showGroupHostPopup: true
              }));
              navigate("/location");
            }
          });
        }
      });
    }
  }

  function validateForm(code) {
    setError('');
    if (typeof code != 'string' || code.match(/^[0-9]{6}$/) == null) {
      setError(`Invalid code: ${code}. Code must have 6 digits and only contain numbers.`);
      return false;
    }
    return true;
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <BackButton to={-1} />
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Host Group</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="keywords" className="mb-2">
                <Form.Label>Share this Code with your Friends!</Form.Label>
                <Form.Control name='code' defaultValue={code} required disabled readOnly />
              </Form.Group>
              <Button className="w-40 mt-10" type="submit">Create Group</Button> 
              <CopyButton textToCopy={code}/>
            </Form>

          </Card.Body>
        </Card>
      </div>
    </Container>

  );
}

const Group = ({ isHost, setGlobalState, globalState }) => {
  const toRender = isHost ? (<Host setGlobalState={setGlobalState} />) : (<Member globalState={globalState} setGlobalState={setGlobalState} />);
  // Create group when visiting the page, set to active.
  // Delete inactive groups regularly.
  // A group is set to inactive after 30 minutes of inactivity.
  return (
    <>
      {toRender}
    </>
  );
}

export default Group;