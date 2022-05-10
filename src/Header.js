import './Header.css'
import firebase from './constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useEffect, useRef, Component } from 'react';
import { signOut } from 'firebase/auth';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection("users");


function Header() {
    return (
        <div className="header">
            <Details/>
        </div>
    ) 
}

function Details() {

    const [chatVisibility, setChat] = useState(false);
    const [logOutVisibility, setLogOut] = useState(false);
    const [info, setInfo] = useState('');

    useEffect(
        () => {
            chicken();
        }
    );

    const toggleChat = () => {
        setChat((prev) => !prev)
    }
    const toggleLogOut = () => {
        setLogOut((prev) => !prev);
    }

    const chicken = async() => {
        const email = auth.currentUser.email;
        const snapshot = await usersRef.doc(email).get(); 
        setInfo(snapshot.data().name);
    }
   

    return (
        <div>
            <div className="rectangle1">
                <h1 className="displayName">{info}</h1>
                <button className = "logOut" onClick = {toggleLogOut}>logOut</button>
                <button className = "newChat" onClick = {toggleChat}>addChat</button>
            </div>
            <ChatPanel visible={chatVisibility} toggle={toggleChat}></ChatPanel>
            <LogOutPanel visible={logOutVisibility} toggle={toggleLogOut}></LogOutPanel>
        </div>
    )
}

function ChatPanel(props) {

    const togglePanel = () => {
        props.toggle();
    }

    return (
        <div className = 'chatPanel' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div>
                <button className="x" onClick={togglePanel}>x</button>
                <h1>New Message</h1>
            </div>
            <form>
                <div className = 'newMessage'>
                    <div className = 'circle1'></div>
                    <input type='email' className="newUser" value = "newFriend"/>
                </div>
                <div className = 'newMessageSubmit'>
                    <button onClick = {togglePanel} >Next</button>
                </div>
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