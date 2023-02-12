import React, {useRef, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'


const DietCheck = () => {
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState("")
    const [value, onChange] = useState('10:00');
    const veganRef = useRef()
    const halalRef = useRef()
    const dairyRef = useRef()
    const glutenRef = useRef()
    const soyRef = useRef()
    const kosherRef = useRef()
    const veggieRef = useRef()


    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            var dietData = {
                halal: halalRef,
                vegan: veganRef,
                dairy: dairyRef,
                gluten: glutenRef,
                soy: soyRef,
                kosher: kosherRef,
                veggie: veggieRef
            }
            setCookie('diet', dietData, { path: '/' });
            
            navigate("/timeGrab");
        } catch (e) {
            // else set an error
            setError(e)
        }
    }
    
    return(
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <>
                    <Card>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <h2 className="text-center mb-4">Dietary Resctrictions</h2>
                                {error && <Alert variant="danger">{error}</Alert>}

                                <div className="mb-3">
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
                                    id={`dairBox`}
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
                                </div>

                                <Button className="w-40 mt-10" type="submit">
                                    Next
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            </div>
        </Container >
    )
  }

  export default DietCheck;