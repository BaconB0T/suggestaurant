import { setUserProperties } from 'firebase/analytics'
import React from 'react'
// Can now declare components

// Stateless, i.e. functional
// function HelloWorld(props) {
//   return (
//     <h1>Hello {props.name}</h1>
//   )
// }

// Stateful with ES6 class syntax
class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: props.name,
      lastname: props.lname
    };
  }
  render() {
    return (
      <h1>Hello {this.state.firstname} {this.state.lastname}</h1>
    )
  }

  // render() {
  //   return (
  //     <h1>Hello {this.props.name}</h1>
  //   )
  // }
}

export default HelloWorld