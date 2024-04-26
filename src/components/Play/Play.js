import React, { useEffect, useState } from "react";
import Board from '../Board/Board';
import styles from '../home/Home.module.css';
import { Chess } from "chess.js";
import Navigationbar from '../nav'
import { useLocation } from 'react-router-dom';
import { auth } from '../Login/firebase-config';
import { collection, getDocs, where, query} from 'firebase/firestore';
import { db } from '../Login/firebase-config';
const Play = () => { 
  const [userData, setUserData] = useState(null); 
   const location = useLocation();
   const friendEmail = location.state ? location.state.friendEmail : null;
       let currentUser = auth.currentUser; 
useEffect(() => {
   const fetchUserData = async () => {
   try {
    while (!currentUser) {
      await new Promise(resolve => setTimeout(resolve, 200));
      currentUser = auth.currentUser; 
    }     
    }  
    catch (error) {
      console.error('Error fetching user data:', error);
    }   
  
  const usersCollectionRef = collection(db, 'backenddata');
  const userQuery = query(usersCollectionRef, where('email', '==', currentUser.email));
  const userSnapshot = await getDocs(userQuery);
  const userDataList = userSnapshot.docs.map(doc => doc.data());
  setUserData(userDataList);
}
  fetchUserData();
}, []);    
    const [chess] = useState(
        new Chess()
    );
    const [fen, setFen] = useState(chess.fen());
    const onMove = (fen) => {
        setFen(fen);
    }
    return (
        <div>
        <Navigationbar/>
        <div className={styles.container}>      
        <div className={styles.user}>
       
     
            <Board
                onMove={onMove}
                chess={chess}
                currFen={fen}
                side={'white'}
            /> 
            {friendEmail && auth.currentUser && 
          <p>Game: {friendEmail} vs {auth.currentUser.email}</p>
        }
             </div>
        </div></div>
    );
};
export default Play;