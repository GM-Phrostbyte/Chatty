import './Header.css'
import firebase from '../constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useEffect, useRef, Component } from 'react';
import { signOut } from 'firebase/auth';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection("users");

function Header() {

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
        const email = auth.currentUser.email;
        const snapshot = await usersRef.doc(email).get(); 
        setName(snapshot.data().name);
    }
   

    return (
        <div className='container bg-secondary'>
            <div className="rectangle1 container-sm d-flex justify-content-center align-items-center">
                <h1 className="displayName h1">{name}</h1>
                <button className = "logOut btn btn-primary" onClick = {toggleLogOut}>logOut</button>
                <button className = "newChat btn btn-primary" onClick = {toggleChat}>addChat</button>
            </div>
            <ChatPanel visible={chatVisibility} toggle={toggleChat}></ChatPanel>
            <LogOutPanel visible={logOutVisibility} toggle={toggleLogOut}></LogOutPanel>
        </div>
    )
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
        setErrors('');
        setNewFriendEmail('');
        setMyName('');
        setNewFriendName('');
        setErrors('');
    }


    const validateForm = async() => {

        const myEmail = auth.currentUser.email;
        console.log('after myEmail');
        const snapshot = await usersRef.doc(newFriendEmail).get();
        console.log('after snapshot');

        const ref = usersRef.doc(myEmail).collection('chats');
        console.log('after ref');

        const snapshot2 = await ref.where('email', '==', newFriendEmail).get();
        console.log('after snapshot2');

        if (!snapshot.exists) {
            setErrors("This user does not exist!");
        } else if (!snapshot2.empty) {
            setErrors("You've already messaged this user!");
        } else {
            return false;
        }
        console.log("1. " + errors);
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
        // deleted async
        const errorsRet = await validateForm();

        console.log("2. " + errors);

        // basically checking if there is an error or not
        if (!errorsRet) {
            await addData();

            console.log("beforeerros");

            //setErrors('');
            console.log("aftereerros");

            togglePanel(); 
            console.log("afterpaneltoggle");
        }
    }

    return (
        <div className = 'chatPanel container' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div>
                <button className=" btn btn-outline-primary x" onClick={togglePanel}>x</button>
                <h1>New Message</h1>
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
                </div>
                <div className = 'newMessageSubmit container'>
                    <button type='submit' className='btn btn-primary'>Next</button>
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
        <div className = 'logOutPanel container' style = {{visibility: props.visible ? 'visible' : 'hidden'}}>
            <div className = "logOutHeader container">
                <h1>Are you sure?</h1>
            </div>
            <form className='form-actions'>
                <div className= 'theFunniShape'>
                    <button className='signOut btn btn-primary' onClick = {() => auth.signOut()}>SIGN OUT</button>
                </div>
                <div className= 'theFunniShape'>
                    <button className='return btn btn-primary' onClick = {togglePanel}>RETURN</button>
                </div>
            </form>
        </div>
    )
}

export default Header;