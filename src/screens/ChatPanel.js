import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection('users');

function ChatContact(props) {
    const details = props.details;
    return (
        <div className='contact'>
            <p>{details}</p>
        </div>
    );
}

function ChatPanel(props) {
    const getChats = async() => {
        const email = auth.currentUser.email;
        const snapshot = await usersRef.doc('connie@gmail.com').collection('chats').get();
        console.log(snapshot.docs) //interesting idk how forEach works
        snapshot.forEach((doc) => {console.log(doc.id, " => ", doc.data())});
      //  return snapshot.forEach((doc) => {doc.data();});
    }
    getChats()

  return (
      <>
      <p>test</p>
      <p>yes</p>
      
      </>
        // <div className="ChatPanel">
        //   <h2>Log In</h2>
        //   <p>{getChats().map(contact => <ChatContact key={contact.id} details={contact}/> )}</p>
        // </div> 
    );
  }

  export default ChatPanel;