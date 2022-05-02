import './Header.css'
import firebase from './constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useRef, Component } from 'react';
import { signOut } from 'firebase/auth';
const auth = firebase.auth();
const firestore = firebase.firestore();

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

    const toggleChat = () => {
        setChat((prev) => !prev)
    }
    const toggleLogOut = () => {
        setLogOut((prev) => !prev);
    }

    return (
        <div>
            <div className="rectangle1">
                <h1 className="displayName">Yes</h1>
                <button type="logOut" onSubmit = {toggleLogOut}>logOut</button>
            </div>
            <ChatPanel visible={chatVisibility}></ChatPanel>
            <button type="addChat" onSubmit = {toggleChat}>addChat</button>
            <LogOutPanel visible={logOutVisibility}></LogOutPanel>
        </div>
    )
}

function ChatPanel(props) {

    const togglePanel = () => {
        props.toggle();
    }

    return (
        <div className = 'chatPanel'>
            <div>
                <input type="button" className="x" onClick={togglePanel}>x</input>
                <h1>New Message</h1>
            </div>
            <form>
                <div className = 'newMessage'>
                    <div className = 'circle1'></div>
                    <input className="newUser" value = "newFriend">Enter Email</input>
                </div>
                <div className = 'newMessageSubmit'>
                    <button onSubmit = {togglePanel} >Next</button>
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
        <div className = 'logOutPanel'>
            <div className = "logOutHeader">
                <h1>Are you sure?</h1>
            </div>
            <form>
                <div className= 'theFunniShape'>
                    <button className='signOut' onSubmit = {signOut}>SIGN OUT</button>
                </div>
                <div className= 'theFunniShape'>
                    <button className='return' onSubmit = {togglePanel}>RETURN</button>
                </div>
            </form>
        </div>
    )
}

export default Header;