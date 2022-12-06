import React, { setState } from "react";
import { insertAccount } from "../firestore";

function Account(props) {
  return (
    <li id={props.account.id}>
      <span>ID: {props.account.id}</span>
      <span>Email: {props.account.email}</span>
      <span>Username: {props.account.username}</span>
    </li>
  )
}

class Accounts extends React.Component {
  constructor(props) {
    super(props);
    // what's in props?
    this.state = {
      email: '',
      password: '',
      username: '',
      handleChange: this.handleChange.bind(this),
      handleSubmit: this.handleSubmit.bind(this),
    }
    props.accounts.then(this.insertAccounts)
  }

  insertAccounts(accounts) {
    const accountsOl = document.getElementById('accounts');
    for(const acc of accounts) {
      React.createElement(Account, acc);
      // accountsOl.appendChild(accountElem);
    }
  }

  handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (event) => {
    alert('Form Submitted!');
    event.preventDefault();
    // TODO: validate, insert
    // validatePassword(this.state.password)
    // if(this.state.username && this.state.email && this.state.password)
    // insert
    insertAccount({
      id: this.state.username,
      email: this.state.email,
      password: this.state.password,
    })
  }

  render() {
    return (
      <div>
        <form onSubmit={this.state.handleSubmit}>
          <label>Username:</label>
          <input type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange} />

          <label>Email:</label>
          <input type="email" id="email" name="email" value={this.state.email} onChange={this.handleChange} />

          <label>Password:</label>
          <input type="password" id="password" name="password" minLength="8" value={this.state.password} onChange={this.handleChange} />
          <br></br>
          <br></br>
          <input type="submit" value="Submit" />
        </form>
        <ol id="accounts">
          {/* {this.state.accounts.map(({ account }) => <Account account={account} />)} */}
        </ol>
      </div>
    );
  }
}

export default Accounts