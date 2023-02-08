import React, { useState, useEffect } from "react";
import { signOutUser, auth } from "../firestore";
import { Link, useNavigate } from 'react-router-dom';

const Account = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const sOut = () => {
    signOutUser().then((res) => {
      if(res) {
        navigate('/');
      } else {
        alert("Something went wrong!")
      }
    });
  }

  return (
    <div display='block'>
      <h1>Hello {user && user.username}</h1>
      <div>Email: {user && user.email}</div>
      <Link to='/account/allergies'>Allergies</Link>
      <br></br>
      <Link to='/account/filters'>Filters</Link>
      <br></br>
      <Link to='/account/history'>History</Link>
      <br></br>
      <button>Change Password (disabled)</button>
      <br></br>
      <button onClick={sOut}>Sign Out</button>
      <br></br>
      <button>Delete Account (disabled)</button>
      <br></br>
    </div>
  );
}

export default Account