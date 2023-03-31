import React, { useEffect } from "react";
 
const Popup = props => {
  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
  );
};

export const TimedPopup = ({content, handleClose}) => {
  function closePopup() {
    document.getElementById('timed-popup').classList.add('fade-out');
  }

  function callHandleClose() {
    closePopup();
    handleClose();
  }

  useEffect(() => {
    setTimeout(callHandleClose, 1_000);
  }, []);

  return (
    <div id='timed-popup' className='timed-popup'>
      <Popup content={content} handleClose={callHandleClose}/>
    </div>
  );
}
 
export default Popup;