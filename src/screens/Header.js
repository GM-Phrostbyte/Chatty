import firebase from '../constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useEffect, useRef, Component} from 'react';
import { signOut } from 'firebase/auth';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'

// icons
import { BsPlusLg } from 'react-icons/bs';
import { BsBoxArrowRight } from 'react-icons/bs';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection("users");

function Header() {

    const [chatVisibility, setChatVisibility] = useState(false);
    const [logOutVisibility, setLogOutVisibility] = useState(false);
    const [name, setName] = useState('');
    const [modalShow, setModalShow] = useState(false);

    useEffect(
        () => {
            getName();
        }
    );

    const toggleChat = () => {
        setChatVisibility((prev) => !prev)
    }
    const toggleLogOut = () => {
        setLogOutVisibility((prev) => !prev);
    }

    const getName = async() => {
        const email = auth.currentUser.email;
        const snapshot = await usersRef.doc(email).get(); 
        setName(snapshot.data().name);
    }
   

    return (
        <div className='container bg-secondary'>
            <div className="header container-sm d-flex justify-content-start align-items-center">
                <div className="nameBox flex-grow-1 d-flex align-items-center">
                  <h1 className="displayName flex-grow-1">{name}</h1>   
                  <button 
                    className = "logOut btn btn-primary d-flex align-items-center justify-content-center" onClick = {toggleLogOut} >
                    <BsBoxArrowRight/>
                  </button>
                </div>
                <button className = "newChat btn btn-primary d-flex align-items-center justify-content-center" onClick = {toggleChat}>
                  <BsPlusLg/>
                </button>
            </div>
            <Button variant="primary" onClick={() => setModalShow(true)}>
              Launch vertically centered modal
            </Button>

            <MyVerticallyCenteredModal
              show={modalShow}
              onHide={() => setModalShow(false)}
            />
            <ChatPanel visible={chatVisibility} toggle={toggleChat}></ChatPanel>
            <LogOutPanel visible={logOutVisibility} toggle={toggleLogOut}></LogOutPanel>
        </div>
    );
}

function ChatPanel(props) {
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [myName, setMyName] = useState('');
    const [newFriendName, setNewFriendName] = useState('');
    const [errors, setErrors] = useState('');

    const togglePanel = () => {
        resetForm();
        props.toggle();
    }

    const resetForm = () => {
        setNewFriendEmail('');
        setMyName('');
        setNewFriendName('');
        setErrors('');
    }


    const validateForm = async() => {

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
            userEmail1 : myEmail,
            userEmail2 : newFriendEmail
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
            togglePanel(); 
        }
    }

    return (
        <div className = 'chatPanel container d-flex justify-content-center align-items-center flex-column' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div className = 'modalHeader container d-flex justify-content-center align-items-center'>
                <button className="btn btn-outline-primary x" onClick={togglePanel}>x</button>
                <p className = "modalHeaderText">New Message</p>
            </div>
            <form onSubmit={handleSubmit} className="form-actions">
                <div className = 'newMessage'>
                    <input 
                        type='email' 
                        className="newUser form-control" 
                        placeholder="Email" 
                        value = {newFriendEmail} 
                        onChange = {handleInputChange}
                    />
                    <p className="errors">{errors}</p>
                </div>
                <div className = 'newMessageSubmit container'>
                    <button type='submit' className='next btn btn-primary'>NEXT</button>
                </div>
            </form>
        </div>
    )
}

function LogOutPanel(props) {

    const togglePanel = (e) => {
        e.preventDefault();
        props.toggle();
    }

    return (
      <div className = 'logOutPanel container d-flex justify-content-center align-items-center flex-column' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div className = "modalHeader container d-flex justify-content-center align-items-center">
                <p className = "modalHeaderText">Are you sure?</p>
            </div>
            <form className ='form-actions d-flex'>
                <div className = 'theFunniShape'>
                    <button className ='signOut btn btn-primary' onClick = {() => auth.signOut()}>SIGN OUT</button>
                </div>
                <div className = 'theFunniShape'>
                    <button className='return btn btn-primary' onClick = {togglePanel}>RETURN</button>
                </div>
            </form>
        </div>
  )
}

function MyVerticallyCenteredModal(props) {
  const [modalShow, setModalShow] = useState(false);
  
  const test = (e) => {
    e.preventDefault();
    props.show = false;
  }

  return (
    <Modal
      show={props.show}
      aria-labelledby="contained-modal-title-vcenter"
      centered    
      contentClassName='logOutPanel'
      dialogClassName='d-flex justify-content-center align-items-center'
    >
      <Modal.Header className="modalHeader d-flex justify-content-center align-items-center">
        <Modal.Title className="modalHeaderText">
          Are you sure?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className='form-actions d-flex justify-content-center align-items-center'>
          <div className='theFunniShape'>
            <button className='signOut btn btn-primary' onClick={() => auth.signOut()}>SIGN OUT</button>
          </div>
          <div className='theFunniShape'>
            <button className='return btn btn-primary' onClick = {() => test}>RETURN</button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
export default Header;