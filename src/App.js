import React, { useState, useRef, useEffect } from "react";
import Header from "./screens/Header";
import firebase from "./constants/FirebaseConfig.js";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import SignIn from "./screens/SignIn";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const auth = firebase.auth();
const firestore = firebase.firestore();

// main App component
function App() {
  const [user] = useAuthState(auth);
  const [siblingChange, setSiblingChange] = useState(true);
  const [currChatId, setCurrChatId] = useState(0);
  const [currChatName, setCurrChatName] = useState("Anything");

  const changeChatId = (newId, name) => {
    setCurrChatId(newId);
    setCurrChatName(name);

    firestore
      .collection("users")
      .doc(auth.currentUser.email)
      .collection("chats")
      .doc(newId)
      .update({
        isRead: true,
      });
    
    firestore
      .collection("users")
      .doc(auth.currentUser.email)
      .update({
        currentChat: newId
      });
  };

  const returnToEmpty = () => {
    setCurrChatId(0);
  };
  const makeUpdate = () => {
    setSiblingChange(!siblingChange);
  };

  return (
    <div className="App">
      {user ? (
        <div className="AppDiv container-fluid d-flex flex-row">
          <div className="col-3">
            <Header
              update={siblingChange}
              makeUpdate={makeUpdate}
              changeChatId={changeChatId}
              currentChatId={currChatId}
            />
          </div>

          <div className="col-9 chat-background">
            {currChatId ? (
              <ChatRoom
                update={siblingChange}
                makeUpdate={makeUpdate}
                currChatId={currChatId}
                currentName={currChatName}
                returnToEmpty={returnToEmpty}
              />
            ) : (
              <EmptyChatRoom />
            )}
          </div>
        </div>
      ) : (
        <SignIn auth={auth} />
      )}
    </div>
  );
}

function EmptyChatRoom() {
  return (
    <main className="container-fluid d-flex flex-column chat-whole align-items-center justify-content-center ">
      <div>
        <span>Select or add a chat to get started!</span>
      </div>
    </main>
  );
}



function ChatRoom({
  update,
  currentName,
  makeUpdate,
  currChatId,
  returnToEmpty,
}) {
  //const dummy = useRef();
  const messagesRef = firestore
    .collection("chats")
    .doc(currChatId)
    .collection("messages");
  const usersRef = firestore.collection("users");
  const query = messagesRef.orderBy("createdAt").limitToLast(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [formValue, setFormValue] = useState("");
  const ref = useRef();
  const count = useRef(0);

  const scrollToBottom = () => {
    ref.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
    
    const chatID = firestore.collection('chats').doc(currChatId);
    chatID.collection('messages').onSnapshot(() => {
        count.current = count.current + 1;
        console.log('bruh count: '+ count.current);
      });
  }, [count.current]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;
    const userEmail = auth.currentUser.email;
    const newMessage = messagesRef.doc();
    const bothUsers = await firestore.collection("chats").doc(currChatId).collection("users").doc("emails").get();
    const otherUser = bothUsers.data().userEmail1 === userEmail ? bothUsers.data().userEmail2 : bothUsers.data().userEmail1;
    const otherUserCurrChat = await usersRef.doc(otherUser).get();
    let otherUserRead = false;

    if (formValue === "") {
      return;
    }

    await newMessage.set({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      id: newMessage.id,
    });

    await usersRef.doc(userEmail).collection('chats').doc(currChatId).update({
      lastMessage: formValue,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      isRead: true
    });


    if (otherUserCurrChat.data().currentChat == currChatId) {
      otherUserRead = true;
    }

    await usersRef.doc(otherUser).collection("chats").doc(currChatId).update({
      lastMessage: formValue,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      isRead: otherUserRead,
      });

    setFormValue("");
    //dummy.current.scrollIntoView({ behavior: "smooth" });
    //scrollToBottom();
  };

  const onInputText = (e) => {
    setFormValue(e.target.value);
  };

  return (
    <main className="container-fluid d-flex flex-column chat-whole">
      <ChatName
        name={currentName}
        onClick={() => setDeleteModalVisible(true)}
      />
      <div className="container d-flex flex-column chat-container px-20">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={ref}></div>
      </div>

      <DeleteModal
        show={deleteModalVisible}
        onHide={() => setDeleteModalVisible(false)}
        currChatId={currChatId}
        returnToEmpty={returnToEmpty}
        makeUpdate={makeUpdate}
      />

      <div>
        <form
          onSubmit={sendMessage}
          className="py-3 form-actions d-flex align-items-center"
        >
          <input
            value={formValue}
            onChange={onInputText}
            className="form-control chat-input px-10"
            placeholder="Message..."
          ></input>
          <button className={"send-btn btn p-0 "} type="submit">
            <svg
              width="63"
              height="63"
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

function ChatName({ name, onClick }) {
  return (
    <div className="chatname container px-2 py-3">
      <div className="row">
        <div className="col-1">
          <LetterProfile name={name} />
        </div>
        <div className="col-8 d-flex align-items-center">
          <p className="name h2">{name}</p>
        </div>
        <div className="col-3 d-flex flex-row-reverse">
          <button
            className="btn btn-light bg-none border-0 trash align-self-center"
            onClick={onClick}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 2.85715C21.4661 2.85715 22.876 3.42063 23.9383 4.43104C25.0006 5.44145 25.6338 6.82149 25.7072 8.28572L25.7143 8.57143H32.8571C33.2213 8.57184 33.5715 8.71126 33.8362 8.96122C34.101 9.21117 34.2603 9.55279 34.2817 9.91628C34.303 10.2798 34.1848 10.6377 33.9511 10.9169C33.7174 11.1961 33.3859 11.3756 33.0243 11.4186L32.8571 11.4286H31.6443L29.9586 32.2186C29.8498 33.5601 29.2401 34.8116 28.2506 35.724C27.2612 36.6364 25.9645 37.143 24.6186 37.1429H15.3814C14.0355 37.143 12.7388 36.6364 11.7494 35.724C10.7599 34.8116 10.1502 33.5601 10.0414 32.2186L8.35429 11.4286H7.14287C6.79296 11.4285 6.45524 11.3001 6.19376 11.0676C5.93228 10.835 5.76523 10.5146 5.72429 10.1671L5.71429 10C5.71434 9.6501 5.8428 9.31238 6.07532 9.0509C6.30783 8.78942 6.62822 8.62237 6.97572 8.58143L7.14287 8.57143H14.2857C14.2857 7.05591 14.8878 5.60246 15.9594 4.53082C17.031 3.45919 18.4845 2.85715 20 2.85715ZM16.7857 16.0714C16.5268 16.0714 16.2767 16.1652 16.0815 16.3354C15.8864 16.5056 15.7595 16.7406 15.7243 16.9971L15.7143 17.1429V28.5714L15.7243 28.7171C15.7596 28.9736 15.8865 29.2086 16.0816 29.3787C16.2768 29.5488 16.5269 29.6425 16.7857 29.6425C17.0446 29.6425 17.2947 29.5488 17.4898 29.3787C17.6849 29.2086 17.8119 28.9736 17.8472 28.7171L17.8572 28.5714V17.1429L17.8472 16.9971C17.8119 16.7406 17.685 16.5056 17.4899 16.3354C17.2948 16.1652 17.0446 16.0714 16.7857 16.0714ZM23.2143 16.0714C22.9554 16.0714 22.7052 16.1652 22.5101 16.3354C22.315 16.5056 22.1881 16.7406 22.1529 16.9971L22.1429 17.1429V28.5714L22.1529 28.7171C22.1881 28.9736 22.3151 29.2086 22.5102 29.3787C22.7053 29.5488 22.9554 29.6425 23.2143 29.6425C23.4732 29.6425 23.7233 29.5488 23.9184 29.3787C24.1135 29.2086 24.2404 28.9736 24.2757 28.7171L24.2857 28.5714V17.1429L24.2757 16.9971C24.2405 16.7406 24.1136 16.5056 23.9185 16.3354C23.7234 16.1652 23.4732 16.0714 23.2143 16.0714ZM20 5.71429C19.2792 5.71406 18.5849 5.9863 18.0564 6.47643C17.5278 6.96656 17.2041 7.63835 17.15 8.35715L17.1429 8.57143H22.8572L22.85 8.35715C22.7959 7.63835 22.4722 6.96656 21.9436 6.47643C21.4151 5.9863 20.7208 5.71406 20 5.71429Z"
                fill="#D1D1D1"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LetterProfile({ name }) {
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div className="letter-icon d-flex">
      <span>{firstLetter}</span>
    </div>
  );
}

function DeleteModal(props) {
  const deleteChat = (currChatId) => {
    
    firestore
    .collection("chats")
    .doc(currChatId)
    .collection("users")
    .doc("emails")
    .get()
    .then(doc => {
      Object.values(doc.data()).forEach(email => {
        firestore
        .collection("users")
        .doc(email)
        .collection("chats")
        .doc(currChatId)
        .delete()
        .then(() => {
          console.log("Document successfully deleted!");
        })
        .catch((error) => {
          console.error("Error removing document: ", error);
        });
      });
    });

    firestore
      .collection("chats")
      .doc(currChatId)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
    props.makeUpdate();
    props.returnToEmpty();
  };

  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      contentClassName="logOutPanel"
      dialogClassName="d-flex justify-content-center align-items-center"
    >
      <Modal.Header className="modalHeader d-flex justify-content-center align-items-center">
        <Modal.Title
          className="modalHeaderText"
          id="contained-modal-title-vcenter"
        >
          Are you sure?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="form-actions d-flex justify-content-center align-items-center">
          <div className="theFunniShape">
            <button
              className="signOut btn btn-primary"
              onClick={() => deleteChat(props.currChatId)}
            >
              DELETE
            </button>
          </div>
          <div className="theFunniShape">
            <Button className="return btn btn-primary" onClick={props.onHide}>
              CANCEL
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={"message px-3 py-2 " + messageClass}>
      <span>{text}</span>
    </div>
  );
}

function ChatHeader(props) {}
export default App;

ChatRoom.defaultProps = {
  currentName: "Connie Wang",
};
