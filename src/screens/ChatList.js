import React, { useState, useEffect } from 'react';
import firebase from '../constants/FirebaseConfig.js';
//import LetterProfile from '../App';

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
    <div className="ChatList d-flex flex-column">
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

function ChatContact({ details, changeChatId}) {
  const time = getTime(details.time);

  console.log('chatcontactran')
  // console.log(details);

  const lastMessage = details.isRead ? 'readMessage' : 'unreadMessage';
  const visible = details.isRead ? 'notVisible' : '';


  const deleteToEmpty = async() => {
    const snapshot = await firestore.collection("users").doc(auth.currentUser.email).get();
    if (!snapshot.data().currentChat) {
      changeChatId(0, "");
    }
  }

  const handleChatSelect = () => {
    changeChatId(details.id, details.name);

    firestore
        .collection("users")
        .doc(auth.currentUser.email)
        .onSnapshot(() => {
          deleteToEmpty();
      });
  }

  return (
      <button className='d-flex flex-row contactList'>     
        <div className='contact d-flex flex-row justify-content-start align-items-center' onClick={handleChatSelect}>
          <div>
            <LetterProfile name={details.name}/>
          </div>
          <div className="info d-flex flex-column align-items-start">
            <div className="topInfo d-flex flex-row">
              <p className="flex-grow-1 contactName">{details.name}</p>
              <p className="time">{time}</p>
            </div>
            <div className="bottomInfo d-flex flex-row">
              <p className={`flex-grow-1 ${lastMessage}`}>{details.lastMessage}</p>
              <div className= {`readDot ${visible}`}></div>
            </div>
          </div>
          </div>
      </button>
  );
}

function LetterProfile({name}) {
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="letter-icon d-flex">
      <span>{firstLetter}</span>
    </div>
  );
}


export default ChatList;