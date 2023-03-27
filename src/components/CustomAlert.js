import { Alert, Button } from "react-bootstrap";

export default function CustomAlert(props) {
  const { setShow, show, alertHeading, alertMessage, alertVariant, buttons } = props;
  return (
    <div style={{ display: 'flex', 'justifyContent': 'center' }}>
      <Alert show={show} variant={alertVariant}>
        <Alert.Heading>{alertHeading}</Alert.Heading>
        <p>{alertMessage}</p>
        <hr />
        <div className="alert-button-flex justify-content-end">
          {buttons && buttons.map(([variant, buttonClick, text], idx) => 
            <Button key={idx} variant={variant} onClick={() => {setShow(false); buttonClick();}}>{text}</Button>
          )}
        </div>
      </Alert>
    </div>
  )
}
