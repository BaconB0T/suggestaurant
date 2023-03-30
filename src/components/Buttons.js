import { FaHome, FaRegUserCircle, FaArrowAltCircleLeft } from 'react-icons/fa';
import { RiLoginBoxLine } from 'react-icons/ri';
import { BsGearFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

export function BackButton(props) {
  const { to } = props;
  const navigate = useNavigate();
  return (
    <FaArrowAltCircleLeft className = "w-20 icon-control back-arrow" onClick={() => navigate(to)}/>
  );
};

export function HomeButton() {
  const navigate = useNavigate();
  return (
    <FaHome className = "w-20 icon-control login-or-account" onClick={() => navigate('/')}/>
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