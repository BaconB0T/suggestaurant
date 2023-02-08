import React from "react";
import { createUserEmailPassword } from "../firestore";
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { withCookies } from 'react-cookie';

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
    };
    this.navigation = this.props.navigation;
    this.cookies = this.props.cookies
  } 

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    console.log(event);
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

    if(this.validateForm(event)) {
      const errorMessage='';
      switch (createUserEmailPassword(docData.username, docData.email, docData.password)) {
        // error codes [here](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
        case "auth/invalid-email":
          errorMessage='That email is invalid.';
          this.setState({
            ['error']: errorMessage
          });
          alert(errorMessage);
        case "ok":
          // passed!
          this.cookies.set('id', )
        default:
          console.log("Failed to create account. See console for details.");
          // Send some statistic for us to diagnose :)
      }
      
      this.navigation.navigate('/accounts');
    } else {
      // Either empty fields or too short password.
      this.setState({
        ['error']: 'All fields must be filled out!'
      });
      alert("All fields must be filled out!");
    }
  }

  validateForm = (event) => {
    this.setState({
      ['error']: ''
    });
    const usernameField = event.target.querySelector('[name=username]');
    const emailField = event.target.querySelector('[name=email]');
    const passwordField = event.target.querySelector('[name=password]');
    const confirmPasswordField = event.target.querySelector('[name=confirmPassword]');
    if(usernameField.value === '' || usernameField.value == null) {
      this.setState({
        ['error']: "Invalid username."
      });
      alert("Invalid username");
      return false;
    }
    if(emailField.value === '' || emailField.value == null/* validate email */) {
      this.setState({
        ['error']: "That email is invalid."
      });
      alert("Invalid email");
      return false;
    }
    if(passwordField.value === '' || passwordField.value.length < 8) {
      this.setState({
        ['error']: "Invalid password."
      });
      alert("Invalid password")
      return false;
    }
    if(passwordField.value !== confirmPasswordField.value) {
      this.setState({
        ['error']: "Passwords do not match."
      });
      alert("Passwords do not match!");
      return false;
    }
    return true;
  }

  render() {
    return (
      <Container
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}>
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Create an Account</h2>
              {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
              <Form onSubmit={this.state.handleSubmit}>
                <Form.Group id="username" className="mb-2">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange} required/>
                </Form.Group>
                <Form.Group id="email" className="mb-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" id="email" name="email" value={this.state.email} onChange={this.handleChange} required/>
                </Form.Group>
                <Form.Group id="password" className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" id="password" name="password" minLength="8" value={this.state.password} onChange={this.handleChange} required/>
                </Form.Group>
                <Form.Group id="confirmPassword" className="mb-2">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" id="confirmPassword" name="confirmPassword" minLength="8" value={this.state.confirmPassword} onChange={this.handleChange} required/>
                </Form.Group>
                <Button className="w-40 mt-10" type="submit">Submit</Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-2">
              Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </Container>
    );
  }
}

export default Signup;