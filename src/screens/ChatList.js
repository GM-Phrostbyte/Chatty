import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';

const auth = firebase.auth();
const firestore = firebase.firestore();
const usersRef = firestore.collection('users');

function ChatList({ changeChatId }) {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    console.log('effectran')
    getChats();
  }, []); 

  const getChats = async() => {
    const email = auth.currentUser.email;
    const usersChatsRef = usersRef.doc(email).collection('chats');
    let contacts = [];

    usersChatsRef.orderBy('time', 'desc').onSnapshot(
      (querySnapshot) => {
        contacts = [];
        querySnapshot.forEach((doc) => {
          const id = doc.id;
          const data = {...doc.data(), id};
          // if time is null
          if (!data.time && doc.metadata.hasPendingWrites) {
            data.time = firebase.firestore.Timestamp.now();
          }
          contacts.push(data);
          // console.log(data);
          // console.log(doc.id);
        });

        setChatList(contacts);
        // console.log(contacts);
      });
  }

  return (
    <div className="ChatList">
      <main>{chatList.map(contact => <ChatContact changeChatId={changeChatId} key={contact.email} details={contact}/> )}</main>
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

function ChatContact({ details, changeChatId, key}) {
  const time = getTime(details.time);

  console.log('chatcontactran')
  // console.log(details);

  const handleChatSelect = () => {
    changeChatId(details.id, details.name);
  }

  return (
      <div className='contact'>
        <button onClick={handleChatSelect}>
          <p>{details.name}</p>
          <p>{details.lastMessage}</p>
          <p>{time}</p>
        </button>
      </div>
  );
}

export default ChatList;