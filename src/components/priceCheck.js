import { FaDollarSign } from "react-icons/fa";
import React, {useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getAccount, validateUser } from '../firestore'
import styles from '../styles/new.module.scss';


const PriceGrab = () => {
  
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [cookies, setCookie] = useCookies(['user']);
    const navigate = useNavigate();
    const [error, setError] = useState("")
    const [price, setPrice] = useState("")


    const handleStarClick = (e, index) => {
      e.preventDefault();
      let clickStates = [...clicked];
      for (let i = 0; i < 5; i++) {
        if (i <= index) clickStates[i] = true;
        else clickStates[i] = false;
      }
  
      setClicked(clickStates);
      setPrice(index)
    };

    async function handleSubmit(e) {
        e.preventDefault(); // don't refresh the page
        try {
            setError("")
            setCookie('price', price, { path: '/' });
            
            navigate("/keywordGrab");
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
                            <div className={styles.rating}>
                                <p>Price</p>
                                <div>
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 0)}
                                        className={clicked[0] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 1)}
                                        className={clicked[1] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 2)}
                                        className={clicked[2] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 3)}
                                        className={clicked[3] ? styles.clickeddollar : null}
                                    />
                                    <FaDollarSign
                                        onClick={(e) => handleStarClick(e, 4)}
                                        className={clicked[4] ? styles.clickeddollar : null}
                                    />
                                </div>
                            </div> 
                            <br></br>
                            <Form onSubmit={handleSubmit}>
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

  export default PriceGrab;