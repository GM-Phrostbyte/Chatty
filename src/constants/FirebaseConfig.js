import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// import 'firebase/compat/database';

const FirebaseConfig = {
    apiKey: "AIzaSyAJwE-qvlnXjG7_uf5pKq8KAIj3i9nsvw4",
    authDomain: "chatty-28a91.firebaseapp.com",
    projectId: "chatty-28a91",
    storageBucket: "chatty-28a91.appspot.com",
    messagingSenderId: "788886971518",
    appId: "1:788886971518:web:a4712aed0a23bd9ad2a42f"
};

if (!firebase.apps.length) {
    firebase.initializeApp(FirebaseConfig);
}

export default firebase;