import React from "react";
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
    console.log(props);

    this.state = {
      accounts: props.accounts,
      email: '',
      password: '',
      username: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    console.log(event)

    const value = event.target.value;
    const name = event.target.name;
    
    this.setState({
      [name]: value
    });
  }
  handleSubmit(event) {
    console.log(event)
    alert('Form Submitted!');
    event.preventDefault();
    // TODO: validate, insert
    // validatePassword(this.state.password)
    if(this.state.username && this.state.email && this.state.password)
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
        Hello
        <form onSubmit={this.state.handleSubmit}>
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange} />

          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value={this.state.email} onChange={this.handleChange} />

          <label for="password">Password:</label>
          <input type="password" id="password" name="password" minlength="8" value={this.state.password} onChange={this.handleChange} />
          <br></br>
          <br></br>
          <input type="submit" value="Submit" />
        </form>
        <ol>
          {this.state.accounts.map(({ account }) => <Account account={account} />)}
        </ol>
      </div>
    );
  }
}

export default Accounts