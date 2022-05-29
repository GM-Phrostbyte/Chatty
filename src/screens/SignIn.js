import React, { useState, useEffect } from "react";
import firebase from "../constants/FirebaseConfig.js";
import SignUp from "./SignUp";
import { TransparentDiv } from "../assets/TransparentDiv.js";

const firestore = firebase.firestore();
export const googleIcon = require("../assets/googleIcon.png");

function SignIn(props) {
  const usersRef = firestore.collection("users");

  const [signinInfo, setSigninInfo] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [active, setActive] = useState(true); // if active display sign-in else sign-up

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const user = await props.auth.signInWithPopup(provider);

    const userInfo = user.additionalUserInfo.profile;

    // does this rewrite to db every login? that could be bad
    await usersRef.doc(`${userInfo.email}`).set({
      name: userInfo.name,
      currentChat: ""
    });
  };

  const signInWithEmail = async () => {
    const { email, password } = signinInfo;

    try {
      await props.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      alert(error.message);
      return;
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSigninInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
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
  };

  const validateForm = () => {
    const errors = {};

    // Ensures all form fields are non-empty
    if (!signinInfo.email) {
      errors.email = "Email is required";
    }
    if (!signinInfo.password) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const switchPage = () => {
    setActive(!active);
  };

  return (
    <>
    <TransparentDiv />
    <TransparentDiv />
    <TransparentDiv/>
    
    <div className="d-flex justify-content-center auth-container bg-primary bg-gradient align-items-center">
      {active ? (
        <div className="container-md">
          <div className="auth card d-flex shadow-lg">
            <div className="card-header">
              <h2 className="h2">Log In</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="form-actions">
                <div className="fields mx-4">
                  <input
                    className="form-control"
                    name="email"
                    placeholder="Email"
                    value={signinInfo.email}
                    onChange={handleFormChange}
                  />
                  <br />
                  {formErrors.email && <p>{formErrors.email}</p>}
                  <input
                    className="form-control"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={signinInfo.password}
                    onChange={handleFormChange}
                  />
                  <br />
                  {formErrors.password && <p>{formErrors.password}</p>}
                  <br />
                  <button type="submit" className="btn btn-primary">
                    LOG IN
                  </button>
                </div>
              </form>
              <br />

              <div className="container d-flex align-items-center flex-column justify-content-center">
                <button
                  className="btn btn-outline-primary google"
                  onClick={signInWithGoogle}
                >
                  <img src={googleIcon} alt="GoogleIcon" />
                  Connect With Google
                </button>
                <div>
                  <small>Don't have an account?</small>
                  <button className="btn btn-link" onClick={switchPage}>
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <SignUp
          auth={props.auth}
          switch={switchPage}
          google={signInWithGoogle}
        />
      )}
    </div>
    </>
  );
}

export default SignIn;
