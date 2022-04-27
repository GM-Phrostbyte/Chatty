import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';
import SignUp from './SignUp';


function SignIn(props) {
  const [signinInfo, setSigninInfo] = useState({email: '', password: ''});
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [active, setActive] = useState(true); // if active display sign-in else sign-up

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    props.auth.signInWithPopup(provider);
  }

  const signInWithEmail = async() => {
    const { email, password } = signinInfo;

    try {
        await props.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
        return;
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSigninInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value
    }));
  };

  useEffect(() => {
    if (hasSubmitted && Object.keys(formErrors).length === 0) {
      signInWithEmail();
    }
  }, [formErrors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validateForm());
    setHasSubmitted(true);
  }

  const validateForm = () => { 
    const errors = {};

    // Ensures all form fields are non-empty 
    if (!signinInfo.email) {
      errors.email = 'Email is required'
    }
    if (!signinInfo.password) {
      errors.password = 'Password is required'
    } 
    
    return errors;
  }

  const switchPage = () => {
    setActive(!active);
  }

  return (
    <div>
      {active ? 
        <>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <input 
                name='email'
                placeholder='Email' 
                value={signinInfo.email} 
                onChange={handleFormChange} /><br/>
              {formErrors.email && <p>{formErrors.email}</p>}
              <input 
                name='password'
                type='password' 
                placeholder='Password' 
                value={signinInfo.password} 
                onChange={handleFormChange} /><br/>
              {formErrors.password && <p>{formErrors.password}</p>}
              <button type='submit'>Login</button>
            </div>
          </form>

          <button onClick={signInWithGoogle}>Sign in with Google</button>
          <h4>Don't have an account?
            <button onClick={switchPage}>Sign Up</button>
          </h4>
        </> 
      : <SignUp auth={props.auth} switch={switchPage}/>}
    </div>
    );
  }

  export default SignIn;