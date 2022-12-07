import React from "react";
import { createRoot } from "react-dom/client";
import { insertAccount, emailOrUsernameUsed } from "../firestore";

function Account(props) {
  // console.log(props);
  return (
    <li id={props.account.email}>
      <span>Username: {props.account.username ? props.account.username : "No id"}</span><br></br>
      <span>Email: {props.account.email}</span><br></br>
    </li>
  );
}

class Accounts extends React.Component {
  constructor(props) {
    super(props);
    const accountsOL = document.createElement('ol');
    accountsOL.id = 'accounts';
    // what's in props?
    this.state = {
      accountsPromise: props.accounts,
      root: createRoot(accountsOL),
      accountsOL: accountsOL,
      email: '',
      password: '',
      username: '',
      handleChange: this.handleChange.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
    };
  } 

  renderAccounts = (accounts) => {
    const root = this.state.root;
    const listOfAccounts = [];
    for(const acc of accounts) {
      listOfAccounts.push(React.createElement(Account, {account: acc, key: acc.email}));
    }

    root.render(listOfAccounts);
  }

  componentDidMount = () => {
    document.getElementById('accountsContainer').appendChild(this.state.accountsOL);
    this.state.accountsPromise.then(this.renderAccounts);
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

    //if(this.validateForm(event)) {
    if(true) {  
      alert('Form Submitted!');
      const userExists = await emailOrUsernameUsed(docData);

      if (!userExists) {
        // insert
        insertAccount(docData);
        
        this.setState({
          username: '',
          email: '',
          password: ''
        });
      } else {
        alert("That username or email is already in use!");
      }
    } else {
      alert("Check the errors below!");
    }
  }

  validateForm = (event) => {
    console.log(event);
    const usernameField = event.target.querySelector('[name=username]');
    const emailField = event.target.querySelector('[name=email]');
    const passwordField = event.target.querySelector('[name=password]');
    if(usernameField.value === '' || usernameField.value == null) {
      return false;
    }
    if(emailField.value === '' || emailField.value == null/* validate email */) {
      return false;
    }
    if(passwordField.value === '' || passwordField.value.length < 8) {
      return false;
    }
  }

  render() {
    return (
      <div>
        <h1>Accounts</h1>
        <form onSubmit={this.state.handleSubmit}>
          <label>Username:</label>
          <input type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange} />
          <br></br>
          <label>Email:</label>
          <input type="email" id="email" name="email" value={this.state.email} onChange={this.handleChange} />
          <br></br>
          <label>Password:</label>
          <input type="password" id="password" name="password" minLength="8" value={this.state.password} onChange={this.handleChange} />
          <br></br>
          <br></br>
          <input type="submit" value="Submit" />
        </form>
        <div id='accountsContainer'>{/* accounts list is appended here. */}</div>
      </div>
    );
  }
}

export default Accounts