import React, { useRef, useState } from 'react';
import { createUserEmailPassword, getAccount } from "../firestore";
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BackButton } from './Buttons';


class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
      handleChange: this.handleChange.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
      error: '',
      user: false,
    };
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  }


  handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: validate, insert
    // validatePassword(this.state.password)
    const docData = {
      id: this.state.username,
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
    };

    if (this.validateForm(event)) {
      var errorMessage = '';
      const acc = await getAccount('username', docData.username);

      if (acc && acc.uid) {
        this.setState({
          'error': "That username is already in use."
        });
      } else {
        const resp = await createUserEmailPassword(docData.username, docData.email, docData.password);
        if (resp === null) {
          // error codes [here](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
          this.setState({
            'error': 'That email is invalid.'
          });
        } else {
          // passed!
          // to render the Navigate component.
          this.setState({
            'user': true
          });
        }
      }
    }
  }

  validateForm = (event) => {
    this.setState({
      'error': ''
    });
    const usernameField = event.target.querySelector('[name=username]');
    const emailField = event.target.querySelector('[name=email]');
    const passwordField = event.target.querySelector('[name=password]');
    const confirmPasswordField = event.target.querySelector('[name=confirmPassword]');
    if (usernameField.value === '' || usernameField.value == null) {
      this.setState({
        'error': "Invalid username."
      });
      // alert("Invalid username");
      return false;
    }
    if (1 > usernameField.value.length || usernameField.value.length > 20) {
      this.setState({
        'error': "Username must be between 1 and 20 characters long"
      });
      return false;
    }
    if (emailField.value === '' || emailField.value == null/* validate email */) {
      this.setState({
        'error': "That email is invalid."
      });
      // alert("Invalid email");
      return false;
    }
    if (passwordField.value === '') {
      this.setState({
        'error': "You must include a password."
      });
      // alert("Invalid password")
      return false;
    }
    if (passwordField.value.length < 8) {
      this.setState({
        'error': "Password must be between 8 and 32 characters long."
      });
      return false;
    }
    if (passwordField.value !== confirmPasswordField.value) {
      this.setState({
        'error': "Passwords do not match."
      });
      // alert("Passwords do not match!");
      return false;
    }
    return true;
  }

  render() {
    let { user } = this.state;
    return (
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <BackButton to='/login' />
          {user && (
            <Navigate to='/account' replace={true} />
          )}
          <h2 className="text-center mb-4">Create an Account</h2>
          {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
          <Form onSubmit={this.state.handleSubmit}>
            <Card>
              <Card.Body>
                <Form.Group id="username" className="mb-2">
                  <Form.Control placeholder="Username" type="text" id="username" name="username" maxLength="20" minLength="1" value={this.state.username} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Group id="email" className="mb-2">
                  <Form.Control placeholder="Email" type="email" id="email" name="email" value={this.state.email} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Group id="password" className="mb-2">
                  <Form.Control placeholder="Password" type="password" id="password" name="password" maxLength="32" minLength="8" value={this.state.password} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Group id="confirmPassword" className="mb-2">
                  <Form.Control placeholder="Confirm Password" type="password" id="confirmPassword" name="confirmPassword" maxLength="32" minLength="8" value={this.state.confirmPassword} onChange={this.handleChange} required />
                </Form.Group>
                <div className="w-100 text-center mt-2">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </Card.Body>
            </Card>
            <br></br>
            <Button className="w-75 mt-10 button-control" type="submit">Submit</Button>
          </Form>
        </div>
      </Container>
    );
  }
}

export default Signup;