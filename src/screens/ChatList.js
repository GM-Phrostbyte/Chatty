import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection('users');

function ChatList(props) {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    console.log('effectran')
    getChats();
  }, []); // WARNING: may cause infinite loop

  const getChats = async() => {
      const email = auth.currentUser.email;
      const usersChatsRef = usersRef.doc(email).collection('chats');
      const snapshot = await usersChatsRef.orderBy('time', 'desc').get();

      let contacts = [];
      snapshot.forEach((doc) => contacts.push(doc.data()));
      setChatList(contacts);
      console.log(contacts);
  }

  return (
    <div className="ChatList">
      <main>{chatList.map(contact => <ChatContact key={contact.email} details={contact}/> )}</main>
    </div> 
  );
}

const getTime = (messageTime) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const curTime = new Date();
  const msgTime = messageTime.toDate();
  const msgDateString = msgTime.toLocaleDateString();

  const msDiff = curTime - msgTime; // difference in times in milliseconds
  const dayDiff = msDiff/1000/60/60/24; // inaccurate: not exactly 24hr/day

  if (curTime.toLocaleDateString() === msgDateString) { // same day returns time
    return msgTime.toLocaleTimeString('en-US', {timeStyle: 'short'});
  } else if (dayDiff <= 7) { // same week returns day as a name
    return days[msgTime.getDay()];
  } else { // more than a week returns date
    return msgDateString;
  }
}

function ChatContact(props) {
  const details = props.details;
  const time = getTime(details.time);

  console.log('chatcontactran')
  return (
      <div className='contact'>
        <button>
          <p>{details.name}</p>
          <p>{details.lastMessage}</p>
          <p>{time}</p>
        </button>
      </div>
  );
}

export default ChatList;