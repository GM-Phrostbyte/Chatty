import firebase from '../constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useEffect, useRef, Component} from 'react';
import { signOut } from 'firebase/auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

// icons
import { BsPlusLg, BsBoxArrowRight } from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection("users");

function Header() {
    const [name, setName] = useState('');
    const [logOutShow, setLogOutShow] = useState(false);
    const [newChatShow, setNewChatShow] = useState(false);

    useEffect(
        () => {
            getName();
        }
    );

    const getName = async() => {
        const email = auth.currentUser.email;
        const snapshot = await usersRef.doc(email).get(); 
        setName(snapshot.data().name);
    }
   

    return (
        <div className='container-fluid bg-secondary'>
            <div className="header container-sm d-flex justify-content-start align-items-center">
                <div className="nameBox flex-grow-1 d-flex align-items-center">
                  <h1 className="displayName flex-grow-1">{name}</h1>   
                  <button
                    className = "logOut btn btn-primary d-flex align-items-center justify-content-center"
                    onClick={() => setLogOutShow(true)}>
                    <BsBoxArrowRight/>
                  </button>
                </div>
                <button 
                  className = "newChat btn btn-primary d-flex align-items-center justify-content-center" 
                  onClick = {() => setNewChatShow(true)}>
                  <BsPlusLg/>
                </button>
            </div>

            <ChatPanel
              show={newChatShow}
              onHide={() => setNewChatShow(false)}
            />

            <LogOutPanel
              show={logOutShow}
              onHide={() => setLogOutShow(false)}
            />
        </div>
    );
}


function ChatPanel(props) {

  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [myName, setMyName] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [errors, setErrors] = useState('');

  const resetForm = () => {
    setNewFriendEmail('');
    setMyName('');
    setNewFriendName('');
    setErrors('');
  }


  const validateForm = async () => {

    const myEmail = auth.currentUser.email;
    const snapshot = await usersRef.doc(newFriendEmail).get();

    const ref = usersRef.doc(myEmail).collection('chats');

    const snapshot2 = await ref.where('email', '==', newFriendEmail).get();

    if (!snapshot.exists) {
      setErrors("This user does not exist!");
    } else if (!snapshot2.empty) {
      setErrors("You've already messaged this user!");
    } else {
      return false;
    }
    return true;
  }

  const handleInputChange = (e) => {
    setNewFriendEmail(e.target.value);
  }

  const addData = async () => {
    const myEmail = auth.currentUser.email;
    const chatID = firestore.collection('chats').doc();
    const snapshot = await usersRef.doc(myEmail).get();
    setMyName(snapshot.data().name);
    const snapshot2 = await usersRef.doc(newFriendEmail).get();
    setNewFriendName(snapshot2.data().name);

    console.log(errors);

    await chatID.collection('users').doc('emails').set({
      userEmail1: myEmail,
      userEmail2: newFriendEmail
    });

    await usersRef.doc(myEmail).collection('chats').doc(chatID.id).set({
      isRead: false,
      lastMessage: '',
      time: '',
      name: newFriendName,
      email: newFriendEmail
    });

    await usersRef.doc(newFriendEmail).collection('chats').doc(chatID.id).set({
      isRead: false,
      lastMessage: '',
      time: '',
      name: myName,
      email: myEmail
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorsRet = await validateForm();


    // basically checking if there is an error or not
    if (!errorsRet) {
      await addData();
      setErrors('');
      resetForm();
      props.onHide();
    }
  }

  return (
    <Modal
      {...props}
      aria-labelledby="newMessage"
      centered    
      contentClassName='chatPanel'
      dialogClassName='d-flex justify-content-center align-items-center'
    >
      <Modal.Header className="modalHeader">
        <button className="x" onClick={props.onHide}>
          <CgClose/>
        </button>
        <Modal.Title className="modalHeaderText" id="newMessage">
          New Message
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="form-actions d-flex justify-content-center align-items-center flex-column">
          <div className='newMessage'>
            <input
              type='email'
              className="newUser form-control"
              placeholder="Email"
              value={newFriendEmail}
              onChange={handleInputChange}
            />
            <p className="errors">{errors}</p>
          </div>
          <div className='newMessageSubmit container'>
            <button type='submit' className='next btn btn-primary'>NEXT</button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

function LogOutPanel(props) {

  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered    
      contentClassName='logOutPanel'
      dialogClassName='d-flex justify-content-center align-items-center'
    >
      <Modal.Header className="modalHeader d-flex justify-content-center align-items-center">
        <Modal.Title className="modalHeaderText" id="contained-modal-title-vcenter">
          Are you sure?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className='form-actions d-flex justify-content-center align-items-center'>
          <div className='theFunniShape'>
            <button className='signOut btn btn-primary' onClick={() => auth.signOut()}>SIGN OUT</button>
          </div>
          <div className='theFunniShape'>
            <Button className='return btn btn-primary' onClick = {props.onHide}>RETURN</Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default Header;