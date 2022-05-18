import "./Sign.css";
import React, { useState, useEffect } from "react";
import firebase from "../constants/FirebaseConfig.js";

const firestore = firebase.firestore();

function SignUp(props) {
  const usersRef = firestore.collection("users");
  const [signupInfo, setSignupInfo] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPwd: "",
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPwd: "",
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const signUpWithEmail = async () => {
    const { email, password } = signupInfo;
    let user = null;

    try {
      user = await props.auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      alert(error.message);
      return;
    }

    console.log(user); // a lot of information

    await usersRef.doc(signupInfo.email).set({
      name: signupInfo.fullName,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (hasSubmitted && Object.keys(formErrors).length === 0) {
      signUpWithEmail();
    }
  }, [formErrors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validateForm());
    setHasSubmitted(true);
  };

  const validateForm = () => {
    const errors = {};
    const v = "valid ";
    const inv = "invalid ";

    // Ensures all form fields are non-empty & other criteria
    errors.fullName = !signupInfo.fullName ? inv : v;
    errors.email = !signupInfo.email ? inv : v;
    
    if (!signupInfo.password) {
      errors.password = inv;
    } else if (signupInfo.password.length < 6) {
      errors.pwdLength = "Password must be at least 6 characters long";
    } else {
      errors.password = v;
    }

    if (!signupInfo.confirmPwd) {
      errors.confirmPwd = "Password confirmation is required";
    } else if (!(signupInfo.password === signupInfo.confirmPwd)) {
      errors.pwdMismatch = "Passwords do not match";
    }

    return errors;
  };

  return (
    <div className="d-flex justify-content-center auth-container bg-primary bg-gradient align-items-center">
      <div className="Sign auth card d-flex shadow-lg">
        <div className="card-header">
          <h2 className="h2">Sign In</h2>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="form-actions">
            <div className="fields mx-4">
              <input
                value={signupInfo.fullName}
                className={"form-control " + formErrors.fullName}
                required
                name="fullName"
                type="text"
                placeholder="Full Name"
                onChange={handleFormChange}
              />
              <div class="valid-feedback">Looks good!</div>
              <br />
              {formErrors.fullName && <p>{formErrors.fullName}</p>}
              <input
                value={signupInfo.email}
                className={"form-control " + formErrors.email}
                name="email"
                required
                type="text"
                placeholder="Email"
                onChange={handleFormChange}
              />
              <br />
              {formErrors.email && <p>{formErrors.email}</p>}
              <input
                value={signupInfo.password}
                className={"form-control " + formErrors.password}
                name="password"
                required
                type="password"
                placeholder="Password"
                onChange={handleFormChange}
              />
              <br />
              {formErrors.password && <p>{formErrors.password}</p>}
              {formErrors.pwdLength && <p>{formErrors.pwdLength}</p>}
              <input
                value={signupInfo.confirmPwd}
                className={"form-control " + formErrors.confirmPwd}
                name="confirmPwd"
                required
                type="password"
                placeholder="Confirm Password"
                onChange={handleFormChange}
              />
              <br />
              {formErrors.confirmPwd && <p>{formErrors.confirmPwd}</p>}
              {formErrors.pwdMismatch && <p>{formErrors.pwdMismatch}</p>}

              <button type="submit" className="login btn btn-primary">
                SIGN UP
              </button>
            </div>
          </form>
          <br />

          <div className="container d-flex align-items-center flex-column justify-content-center">
            <button
              class="btn btn-outline-primary google"
              onClick={props.google}
            >
              Connect With Google
            </button>
            <div>
              <small>Already have an account?</small>
              <button class="btn btn-link" onClick={props.switch}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
