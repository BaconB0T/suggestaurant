import { getAuth } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { groupExists, createGroup, getCode, joinGroup } from '../firestore';

const Member = () => {
  const groupCodeRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cookies, setCookie] = useCookies(['user']);
  const [variant, setVariant] = useState("danger");

  async function handleSubmit(e) {
    e.preventDefault(); // don't refresh the page
    setError('');
    const code = e.target.querySelector('[name=code]').value;
    console.log('typeof(code)');
    console.log(typeof (code));
    console.log(code);
    // errors are set inside of validateForm(e);
    if (validateForm(e)) {
      groupExists(code).then((val) => {
        if (val) {
          // Group exists, join it.
          setCookie('groupcode', groupCodeRef.current.value, { path: '/' });
          joinGroup(code, getAuth().currentUser);
          navigate("/dietaryRestrictions");
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

    if(missingCode) {
      setError('You must include a code.');
      return false;
    }

    if(code.length !== 6) {
      setError('Code must be 6 digits long.');
      return false;
    }
    return true;
  }

  function handleChange(event) {
    const value = event.target.value;
    if(value.length !== 6) {
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
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Keywords</h2>
            {error && <Alert variant={variant || "danger"}>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="keywords" className="mb-2">
                <Form.Label>Group Code</Form.Label>
                <Form.Control name='code' ref={groupCodeRef} 
                  onChange={handleChange} minLength="6" maxLength="6" 
                  placeholder='Group code' required 
                />
              </Form.Group>
              <Button className="w-40 mt-10" type="submit">Go</Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

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

  async function handleSubmit(e) {
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
              setError('Group not created, please try again later.');
            } else {
              // setGlobalState({ group: group, host: true });
              // setGroup(group);
              // setHost(true);
              setCookie('groupcode', groupCodeRef.current, { path: '/' });
              // .value is undefined, only .current exists and its value is what we need.
              // setCookie('groupcode', groupCodeRef.current.value, { path: '/' });
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
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Keywords</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="keywords" className="mb-2">
                <Form.Label>Group Code</Form.Label>
                <Form.Control name='code' defaultValue={code} required disabled readOnly />
              </Form.Group>
              <Button className="w-40 mt-10" type="submit">
                Go
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>

  );
}

const Group = ({ isHost, setGlobalState }) => {
  console.log(isHost);
  const toRender = isHost ? (<Host setGlobalState={setGlobalState} />) : (<Member setGlobalState={setGlobalState} />);
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