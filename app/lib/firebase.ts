import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { type Message } from "ai/react";


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


// baseline-{userid}; stage1-{userid}
export const addCollection = async (collectionName: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export const addMessagetoCollection = async (collectionName: string, chatId: string, messages: Message[]) => {
    // if message id exists, update
    // else, add
    // const docRef = doc(db, collectionName, chatId);

    const docSnap = await getDocs(collection(db, collectionName));
    if (docSnap.size > 0) {
        await updateDoc(doc(db, collectionName), {
            messages: messages,
            timestamp: new Date().toISOString(),
        });
    } else {
        await addDoc(collection(db, collectionName), {
            chatId: chatId,
            messages: messages,
            timestamp: new Date().toISOString(),
        });
    }
}

export const getCollection = async (collectionName: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        // querySnapshot.forEach((doc) => {
        //     console.log(`${doc.id} => ${doc.data()}`);
        // });
        return querySnapshot.docs.map((doc) => doc.data());
    } catch (e) {
        console.error("Error getting document: ", e);
        return [];
    }
}