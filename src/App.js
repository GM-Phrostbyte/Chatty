import React, { useState, useRef } from "react";
import Header from "./screens/Header";
import firebase from "./constants/FirebaseConfig.js";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import SignIn from "./screens/SignIn";

const auth = firebase.auth();
const firestore = firebase.firestore();

// main App component
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {user ? (
        <div className="container d-flex flex-row">
          <Header />
          <ChatRoom />
        </div>
      ) : (
        <SignIn auth={auth} />
      )}
    </div>
  );
}

function ChatRoom(props) {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limitToLast(25);
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const onInputText = (e) => {
    setFormValue(e.target.value);
  };

  return (
    <main className="container d-flex flex-column">
      <ChatName name={props.currentName} />
      <div className="container d-flex flex-column flex-grow-1">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>

      <div>
        <form onSubmit={sendMessage} className="form-actions d-flex align-items-center">
          <input
            value={formValue}
            onChange={onInputText}
            className="form-control chat-input p-1"
          ></input>
          <button className="send-btn btn p-0" type="submit">
            <svg
              width="50"
              height="50"
              viewBox="0 0 63 63"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M31.5 0.25C35.6038 0.25 39.6674 1.05831 43.4589 2.62877C47.2503 4.19922 50.6953 6.50108 53.5971 9.40291C56.4989 12.3047 58.8008 15.7497 60.3712 19.5411C61.9417 23.3326 62.75 27.3962 62.75 31.5C62.75 39.788 59.4576 47.7366 53.5971 53.5971C47.7366 59.4576 39.788 62.75 31.5 62.75C27.3962 62.75 23.3326 61.9417 19.5411 60.3712C15.7497 58.8008 12.3047 56.4989 9.40291 53.5971C3.5424 47.7366 0.25 39.788 0.25 31.5C0.25 23.212 3.5424 15.2634 9.40291 9.40291C15.2634 3.5424 23.212 0.25 31.5 0.25ZM19 18.0938V28.5313L41.3125 31.5L19 34.4688V44.9063L50.25 31.5L19 18.0938Z"
                fill="#A168DB"
              />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}

function ChatName({ name }) {
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="chatname container bg-warning p-2">
      <div className="row">
        <div className="col-1">
          <div className="letter-icon">
            <p>{firstLetter}</p>
          </div>
        </div>
        <div className="col-8">
          <p className="h2">{name}</p>
        </div>
        <div className="col-3">
          <button className="btn btn-light border-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-trash-fill"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={"message " + messageClass}>
      <p>{text}</p>
    </div>
  );
}

function ChatHeader(props) {}
export default App;

ChatRoom.defaultProps = {
  currentName: "Connie Wang",
};
