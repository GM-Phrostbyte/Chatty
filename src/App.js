import './App.css';
import firebase from './constants/FirebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useState, useRef } from 'react';
import SignIn from './screens/SignIn';

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {user ? <ChatRoom /> : <SignIn auth={auth}/>}
    </div>
  );
}

function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);
  const [messages] = useCollectionData(query);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid} = auth.currentUser; 
    
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  const onInputText = (e) => {
    setFormValue(e.target.value);
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/> )}
        <div ref={dummy}></div> 
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={onInputText}></input>
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser ? 'sent' : 'received';
  
  return (
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  );
}

export default App;
