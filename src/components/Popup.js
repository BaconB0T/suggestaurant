import React, { useEffect } from "react";
import '../styles/PopupStyling.css';
import { useState } from "react";

const Popup = props => {

  function closePopup(e) {
    e.stopPropagation();
    const onClose = props.onClose;
    document.getElementById('popup').classList.add('closed');
    onClose && onClose();
  }

  return (
    <div id='popup' className="popup-box" onClick={closePopup}>
      <div className="box" onClick={e => e.stopPropagation()}>
        {props.content}
        <div className="close-icon" onClick={closePopup}>x</div>
      </div>
    </div>
  );
};

export const TimedPopup = props => {
  const { content, onClose } = props;
  const [manuallyClosed, setClosed] = useState(false);

  useEffect(() => {
    function timeoutPopup() {
      const popup = document.getElementById('timed-popup')
      if (popup) popup.classList.add('fade-out');
      setTimeout(() => setClosed(true), 3_000)
    }
    setTimeout(timeoutPopup, 2_000);
  }, [setClosed]);

  useEffect(() => {
    if (manuallyClosed) onClose && onClose()
  }, [manuallyClosed, onClose])

  return (
    <div id='timed-popup' className='timed-popup'>
      <Popup content={content} onClose={() => setClosed(true)}/>
    </div>
  );
}
 
export default Popup;