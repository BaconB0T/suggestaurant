// Importing modules
import React, { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';

function DisplayTest() {
    // usestate for setting a javascript
    const [business_ID, setBusiness_ID] = useState("")
    const [cookies, setCookie] = useCookies(['user']);


    // object for storing and using data
	// Using useEffect for single rendering
	useEffect(() => {
		// Using fetch to fetch the api from
		// flask server it will be redirected to proxy
        setBusiness_ID(cookies["businesslist"])
	}, []);

	return (
		<div className="App">
            <header className="App-header">
                <h1>Keywords: </h1>
                {/* Calling a data from setdata for showing */
                    business_ID
                }
            </header>
        </div>
	);
}

export default DisplayTest;
