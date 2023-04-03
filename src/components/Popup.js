import React, { useEffect } from "react";
import './PopupStyling.css';

const Popup = props => {

  function closePopup() {
    const onClose = props.onClose;
    document.getElementById('popup').classList.add('closed');
    onClose && onClose();
  }

  return (
    <div id='popup' className="popup-box" onClick={() => console.log("clicked background")}>
      <div className="box" onClick={() => console.log("clicked popup")}>
        {props.content}
        <div className="close-icon" onClick={closePopup}>x</div>
      </div>
    </div>
  );
};

export const TimedPopup = props => {
  const { content } = props;

  function closePopup() {
    document.getElementById('timed-popup').classList.add('fade-out');
  }

  function closePopupCallback() {
    const onClose = props.onClose;
    closePopup();
    onClose && onClose();
  }

  useEffect(() => {
    setTimeout(closePopupCallback, 2_000);
  }, []);

  return (
    <div id='timed-popup' className='timed-popup'>
      <Popup content={content} onClose={closePopupCallback}/>
    </div>
  );
}
 
export default Popup;