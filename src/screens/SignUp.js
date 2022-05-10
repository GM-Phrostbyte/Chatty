import './Sign.css';
import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';
import './SignUp.css';

const firestore = firebase.firestore();

function SignUp(props) {

  const usersRef = firestore.collection('users');

  const [signupInfo, setSignupInfo] = useState({fullName: '', email: '', password: '', confirmPwd: ''});
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const signUpWithEmail = async() => {
  const { email, password } = signupInfo;
    let user = null;

    try {
        user = await props.auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
        return;
    }

    
    console.log(user) // a lot of information 

    await usersRef.doc(signupInfo.email).set({
      name: signupInfo.fullName,
    });
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value
    }));
  }

  useEffect(() => {
    if (hasSubmitted && Object.keys(formErrors).length === 0) {
      signUpWithEmail();
    }
  }, [formErrors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validateForm());
    setHasSubmitted(true);
  }

  const validateForm = () => { 
    const errors = {};

    // Ensures all form fields are non-empty & other criteria
    if (!signupInfo.fullName) {
      errors.fullName = 'Full name is required'
    }
    if (!signupInfo.email) {
      errors.email = 'Email is required'
    }
    if (!signupInfo.password) {
      errors.password = 'Password is required'
    } else if (signupInfo.password.length < 6) {
      errors.pwdLength = 'Password must be at least 6 characters long'
    }
    if (!signupInfo.confirmPwd) {
      errors.confirmPwd = 'Password confirmation is required'
    } else if (!(signupInfo.password === signupInfo.confirmPwd)) {
      errors.pwdMismatch = 'Passwords do not match';
    }
    
    return errors;
  }

  return (
    <div className="Sign">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginTop: "-100%"}}>
          <input 
              value={signupInfo.fullName}
              name="fullName"
              type="text"
              placeholder="Full Name"
              onChange={handleFormChange} /><br/>
          {formErrors.fullName && <p>{formErrors.fullName}</p>}
          <input 
              value={signupInfo.email}
              name="email"
              type="text"
              placeholder="Email"
              onChange={handleFormChange} /><br/>
          {formErrors.email && <p>{formErrors.email}</p>}
          <input 
              value={signupInfo.password}
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleFormChange} /><br/>
          {formErrors.password && <p>{formErrors.password}</p>}
          {formErrors.pwdLength && <p>{formErrors.pwdLength}</p>}
          <input 
              value={signupInfo.confirmPwd}
              name="confirmPwd"
              type="password"
              placeholder="Confirm Password"
              onChange={handleFormChange} /><br/>
          {formErrors.confirmPwd && <p>{formErrors.confirmPwd}</p>}
          {formErrors.pwdMismatch && <p>{formErrors.pwdMismatch}</p>}
          <button type='submit' className='login'>Sign Up</button>
        </div>
      </form>

      <button onClick={props.google}>Connect with Google</button>
      <h4>Already have an account?
        <button onClick={props.switch} className="signup">Sign In</button>
      </h4>
    </div>
    );
  }


  export default SignUp;