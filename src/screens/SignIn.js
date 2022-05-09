import './Sign.css';
import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';
import SignUp from './SignUp';

const firestore = firebase.firestore();

function SignIn(props) {
  const usersRef = firestore.collection('users');

  const [signinInfo, setSigninInfo] = useState({email: '', password: ''});
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [active, setActive] = useState(true); // if active display sign-in else sign-up

  const signInWithGoogle = async() => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const user = await props.auth.signInWithPopup(provider);

    const userInfo = user.additionalUserInfo.profile;

    // does this rewrite to db every login? that could be bad
    await usersRef.doc(`${userInfo.email}`).set({
      name: userInfo.name,
    });
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
        <div className="Sign">
          <h2>Log In</h2>
          <form onSubmit={handleSubmit}>
            <div className="fields">
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
              <button type='submit' >Log In</button>
            </div>
          </form>

            <button onClick={signInWithGoogle}>Connect With Google</button>

            <h4>Don't have an account?
              <button onClick={switchPage} className="signup" >Sign Up</button>
            </h4>
        </div> 
      : <SignUp auth={props.auth} switch={switchPage} google={signInWithGoogle}/>}
    </div>
    );
  }

  export default SignIn;