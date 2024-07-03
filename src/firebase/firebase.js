import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  off,
  remove,
  update,
  get,
  equalTo,
  query,
  orderByChild,
} from "firebase/database";
import {
  getStorage,
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDa4WYnmChjBu7fMYsGtK704w7S-GBLj6Y",
  authDomain: "appraisal-bc8e7.firebaseapp.com",
  projectId: "appraisal-bc8e7",
  storageBucket: "appraisal-bc8e7.appspot.com",
  messagingSenderId: "973776284297",
  appId: "1:973776284297:web:354f4584c0c00546497458",
  measurementId: "G-LX4YN761F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const imgDB = getStorage(app);

export {
  app,
  auth,
  database,
  imgDB,
  ref,
  onValue,
  off,
  equalTo,
  remove,
  query,
  orderByChild,
  get,
  update,
  uploadBytes,
  getDownloadURL,
  storageRef,
};
