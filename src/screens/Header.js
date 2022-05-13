import './Header.css'
import firebase from '../constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useEffect, useRef, Component } from 'react';
import { signOut } from 'firebase/auth';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection("users");
const email = auth.currentUser.email;

function Header() {
    return (
        <div className="header">
            <Details/>
        </div>
    ) 
}

function Details() {

    const [chatVisibility, setChatVisibility] = useState(false);
    const [logOutVisibility, setLogOutVisibility] = useState(false);
    const [name, setName] = useState('');

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
        const snapshot = await usersRef.doc(email).get(); 
        setName(snapshot.data().name);
    }
   

    return (
        <div>
            <div className="rectangle1">
                <h1 className="displayName">{name}</h1>
                <button className = "logOut" onClick = {toggleLogOut}>logOut</button>
                <button className = "newChat" onClick = {toggleChat}>addChat</button>
            </div>
            <ChatPanel visible={chatVisibility} toggle={toggleChat}></ChatPanel>
            <LogOutPanel visible={logOutVisibility} toggle={toggleLogOut}></LogOutPanel>
        </div>
    )
}

function ChatPanel(props) {
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [errors, setErrors] = useState('');
    const togglePanel = () => {
        props.toggle();
    }

    const validateForm = async() => {
        const snapshot = await usersRef.doc(newFriendEmail).get();
        if (!snapshot.exists) {
            setErrors("This user does not exist!");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        validateForm();
        if (!errors.isEmpty()) {
            

            //try
            const chatID = firestore.collection('Chats').doc();

            await chatID.collection('users').doc('emails').set({
                userEmail1 : email,
                userEmail2 : newFriendEmail
            });

            togglePanel();
        }
    }

    return (
        <div className = 'chatPanel' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div>
                <button className="x" onClick={togglePanel}>x</button>
                <h1>New Message</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className = 'newMessage'>
                    <input type='email' className="newUser" placeholder="Email" value = {newFriendEmail} onChange/>
                </div>
                <div className = 'newMessageSubmit'>
                    <button type='submit'>Next</button>
                </div>
                <p>{errors}</p>
            </form>
        </div>
    )
}

function LogOutPanel(props) {

    const togglePanel = () => {
        props.toggle();
    }

    return (
        <div className = 'logOutPanel' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div className = "logOutHeader">
                <h1>Are you sure?</h1>
            </div>
            <form>
                <div className= 'theFunniShape'>
                    <button className='signOut' onClick = {() => auth.signOut()}>SIGN OUT</button>
                </div>
                <div className= 'theFunniShape'>
                    <button className='return' onClick = {togglePanel}>RETURN</button>
                </div>
            </form>
        </div>
    )
}

export default Header;