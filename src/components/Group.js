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
  const [show, setShow] = useState(false);
  const [groupCode, setGroupCode] = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); // don't refresh the page
    setError('');
    const code = e.target.querySelector('[name=code]').value;
    setGroupCode(code);
    // errors are set inside of validateForm(e);
    if (validateForm(e)) {
      groupExists(code).then((val) => {
        if (val) {
          // Group exists, confirmation popup.
          // Then join it.
          joinGroup(code, getAuth().currentUser).then(joined => {
            if(joined) {
              setGlobalState({
                ...globalState,
                showGroupJoinPopup: true
              });
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

  function validateForm(event) {
    setVariant('danger');
    setError('');
    const codeField = event.target.querySelector('[name=code]');
    const code = codeField.value;
    const missingCode = code === '' || code === null;

    if (missingCode) {
      setError('You must include a code.');
      return false;
    }

    if (code.length !== 6) {
      setError('Code must be 6 digits long.');
      return false;
    }
    return true;
  }

  function handleChange(event) {
    const value = event.target.value;
    setGroupCode(value);
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
  // const [group, setGroup] = useCookies(['group']);
  // const [host, setHost] = useCookies(['host']);
  const navigate = useNavigate();
  const groupCodeRef = useRef();
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    getCode().then((code) => {
      setCode(code);
      groupCodeRef.current = code;
    });
  }, []);

  function clipboardCode() {
    // const code = state.getCode()
    navigator.clipboard.writeText(code).then(() => {
      console.log(`Copied addres to clipboard`);
    });
  }

  async function handleSubmit(e) {
    console.log(cookies);
    e.preventDefault(); // don't refresh the page
    setError('');
    const code = e.target.querySelector('[name=code]').value;
    // errors are set inside of validateForm(e);
    if (validateForm(e)) {
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
              navigate("/location");
            }
          });
        }
      });
    }
  }

  function validateForm(event) {
    setError('');
    const codeField = event.target.querySelector('[name=code]');
    const code = codeField.value;
    const missingCode = code === '' || code === null;

    if (missingCode) {
      setError('You must include a code.');
      return false;
    }

    if (code.length !== 6) {
      setError('Code must be 6 digits long.');
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
              <Button className="w-40 mt-10" type="submit">
                Create Group
              </Button> <CopyButton textToCopy={code}/>
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