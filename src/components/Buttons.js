import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft } from 'react-icons/fa';
import { RiLoginBoxLine } from 'react-icons/ri';
import { BsGearFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { faCopy } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TimedPopup } from './Popup';
import { useState } from 'react';

export function BackButton(props) {
  const { to } = props;
  const navigate = useNavigate();
  return (
    <div style={{zIndex: 1}}>
      <FaArrowAltCircleLeft 
        className = "w-20 icon-control back-arrow" 
        onClick={() => navigate(to)}  
      />
    </div>
  );
};

export function HomeButton() {
  const navigate = useNavigate();
  return (
    <div style={{zIndex: 1}}>
      <FaHome 
        className = "w-20 icon-control login-or-account" 
        onClick={() => navigate('/')}
        style={{zIndex: 1}}
        />
    </div>
  );
}

export function AccountOrLoginButton(props) {
  const {isAnonymous} = props;
  const navigate = useNavigate();
  if (isAnonymous) {
    return (<RiLoginBoxLine className = "w-20 icon-control login-or-account" onClick={() => navigate('/login')}/>);
  }
  return (<FaRegUserCircle className = "w-20 icon-control login-or-account" onClick={() => navigate('/account')}/>);
}

export function SettingsButton() {
  const navigate = useNavigate();
  return (
    <BsGearFill className = "w-20 icon-control settings" onClick={() => navigate('/settings')}/>
  );
}

export function CopyButton({textToCopy}) {
  const [showPopup, setShowPopup] = useState(false)
  return (
    <div style={{display: "inline-block"}}>
      {showPopup && <TimedPopup content={<b>Copied!</b>} onClose={() => {setShowPopup(false)}} />}
      <button type="button" onClick={() => {navigator.clipboard.writeText(textToCopy); setShowPopup(true)} } className="btn btn-secondary">
        <FontAwesomeIcon icon={faCopy} color="white" size="2x" />
      </button>
    </div>
  )
}