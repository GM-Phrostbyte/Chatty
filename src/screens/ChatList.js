import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection('users');

function ChatContact(props) {
  const details = props.details;
  return (
      <div className='contact'>
        <p>{details.name}</p>
        <p>{details.lastMessage}</p>
      </div>
  );
}

function ChatList(props) {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    getChats();
  }, []);

  const getChats = async() => {
      const email = auth.currentUser.email;
      const usersChatsRef = usersRef.doc('gm.alexc03@gmail.com').collection('chats');
      const snapshot = await usersChatsRef.orderBy('time', 'desc').get();

      let contacts = [];
      snapshot.forEach((doc) => contacts.push(doc.data()));
      setChatList(contacts);
  }

  return (
    <div className="ChatList">
      <main>{chatList.map(contact => <ChatContact key={contact.email} details={contact}/> )}</main>
    </div> 
  );
}

export default ChatList;