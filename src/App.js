import './App.css';
import firebase from './constants/FirebaseConfig.js';
import React, { useState, useRef} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      {user ? <ChatRoom/> : <SignIn/>}
      
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  
  return (
    <button onClick={signInWithGoogle}>Sign in with Google.</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  
  // event handler sendMessage
  const sendMessage = async(event) => {
    // to prevent refresh
    event.preventDefault();

    const {uid} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid
    })
    // blank
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth'});
  }

  const onInputText = (e) => {
    setFormValue(e.target.value);
  }

  return(
    <div>
      <main>
        {messages && messages.map(msg => <ChatMessage key = {msg.id} message={msg}/>)}
        <div ref = {dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={onInputText}></input>
        <button type="submit">Send</button>
      </form>
    </div>

  );
}

function ChatMessage(props) {
  const {text, uid} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  return(
    <div className={'message ' + messageClass}>
      <p>{text}</p>
    </div>
  );
}


export default App;
