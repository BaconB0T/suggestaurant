import React, {useRef, useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { Navigate, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { updateGroupMember, hasDietaryRestrictions, getFilters } from '../firestore';
import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft} from 'react-icons/fa';
import { BsGearFill } from "react-icons/bs";

const DietCheck = ({user}) => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [check, setCheck] = useState(false)
    const veganRef  = useRef();
    const halalRef  = useRef();
    const dairyRef  = useRef();
    const glutenRef = useRef();
    const soyRef    = useRef();
    const kosherRef = useRef();
    const veggieRef = useRef();
    const [loginOrAccount, setLoginOrAccount] = useState("Login")

    async function handleClickBack() {
        try {
            navigate("/location");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickSettings() {
        try {
            navigate("/");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleClickLogin() {
        try {
            navigate("/login");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page

        try {
            setError("")
            const dietData = {
                'Dairy-free':  !dairyRef.current.checked ? "" : "dairy",
                'Gluten-free': !glutenRef.current.checked? "" : "gluten",
                'Halal':       !halalRef.current.checked ? "" : "halal",
                'Kosher':      !kosherRef.current.checked? "" : "kosher",
                'Soy-free':    !soyRef.current.checked   ? "" : "soy",
                'Vegan':       !veganRef.current.checked ? "" : "vegan",
                'Vegetarian':  !veggieRef.current.checked? "" : "veggie"
            }
            setCookie('diet', dietData, { path: '/' });
            // No difference between host and member.
            if(cookies['groupCode'] != 0) {
                updateGroupMember(cookies['groupCode'], 'diet', dietData);
            }
            navigate("/timeGrab");
        } catch (e) {
            // else set an error
            console.error(e)
            setError(e.message)
        }
    }
    
    useEffect(() => {
        async function beegFunction()
        {
            if (!(user.isAnonymous) && hasDietaryRestrictions(user.uid)) {
                async function goGoGroupModeDiet()
                {
                    const doc = await getFilters(user.uid)
                    const diet = doc.filters.dietaryRestrictions
                    const dietData = {
                        'Dairy-free':  !diet.includes("Dairy-free") ? "" : "dairy",
                        'Gluten-free': !diet.includes("Gluten-free") ? "" : "gluten",
                        'Halal':       !diet.includes("Halal") ? "" : "halal",
                        'Kosher':      !diet.includes("Kosher") ? "" : "kosher",
                        'Soy-free':    !diet.includes("Soy-free") ? "" : "soy",
                        'Vegan':       !diet.includes("Vegan") ? "" : "vegan",
                        'Vegetarian':  !diet.includes("Vegetarian") ? "" : "veggie" 
                    }
                    setCookie('diet', dietData, { path: '/' });
                    if(cookies['groupCode'] != 0) {
                        updateGroupMember(cookies['groupCode'], 'diet', dietData);
                    }
                }
                goGoGroupModeDiet()
                setCheck(true)
              }
        }
        beegFunction()
    }, [user])


    if(check)
    {
        return (
            <Navigate to='/timeGrab' />
          );
    }

    return(
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
            <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => handleClickBack()}/>
            <FaHome className = "w-20 icon-control login-or-account" onClick={() => handleClickSettings()}/>
                <>
                {/* Note:  Ask Christian about how he styled these in preferences. */}
                        <Form onSubmit={handleSubmit}>
                            <h3 className="text-center mb-4">Tell us your<br></br>dietary restrictions!</h3>
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Card className="card-control">
                                <Card.Body>
                                    {/* <div className="mb-3"> */}
                                        <Form.Check 
                                            type="checkbox"
                                            id={`veganBox`}
                                            label={`Vegan`}
                                            ref={veganRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`halalBox`}
                                            label={`Halal`}
                                            ref={halalRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`dairyBox`}
                                            label={`Dairy`}
                                            ref={dairyRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`soyBox`}
                                            label={`Soy`}
                                            ref={soyRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`glutenBox`}
                                            label={`Gluten`}
                                            ref={glutenRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`veggieBox`}
                                            label={`Vegetarian`}
                                            ref={veggieRef}
                                        />
                                        <Form.Check 
                                            type="checkbox"
                                            id={`KosherBox`}
                                            label={`Kosher`}
                                            ref={kosherRef}
                                        />
                                    {/* </div> */}
                                </Card.Body>
                            </Card>         
                            <br></br> 
                            <Button className="w-75 mt-10 button-control" type="submit">
                                Next
                            </Button>
                        </Form>
                </>
            </div>
        </Container >
    )
  }

  export default DietCheck;