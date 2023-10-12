/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../../Firebase";
import { doc, setDoc } from "firebase/firestore";
// create context
const AuthContext = createContext();

//Provider Context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // Sign In
  const signInGoogle = async (email, password) => {
    const auth = getAuth();
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(response.user);
      console.log(response);
      localStorage.setItem("email", response?.user?.email);
      localStorage.setItem("uid", response?.user?.email);
      return response.user;
    } catch (error) {
      // Handle login errors here
      console.error("Error logging in:", error.message);
      return null;
    }

    // // Add user data to the database
    // const userRef = doc(db, "users", user.email);
    // const userData = {
    //   name: user.displayName,
    //   email: user.email,
    //   avatar: user.photoURL,
    //   uid: user.uid,
    // };
    // await setDoc(userRef, userData, { merge: true });
  };

  // SIGN UP
  const signUpGoogle = async (email, password) => {
    const auth = getAuth();
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // setCurrentUser(response.user);
      console.log(response);
      // localStorage.setItem("email", response?.user?.email);
      // localStorage.setItem("uid", response?.user?.uid);
      return response.user;
    } catch (error) {
      // Handle login errors here
      console.error("Error Sign up:", error.message);
      return null;
    }

    // // Add user data to the database
    // const userRef = doc(db, "users", user.email);
    // const userData = {
    //   name: user.displayName,
    //   email: user.email,
    //   avatar: user.photoURL,
    //   uid: user.uid,
    // };
    // await setDoc(userRef, userData, { merge: true });
  };

  // Sign Out
  const logout = () => {
    signOut(auth);
  };

  //   set current User

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    signInGoogle,
    logout,
    signUpGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
