import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import Navigationbar from '../nav';
import { db } from '../Login/firebase-config';
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth } from '../Login/firebase-config';
import { NavLink, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let currentUser = auth.currentUser; 
        while (!currentUser) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          currentUser = auth.currentUser; 
        }          
        const usersCollectionRef = collection(db, 'backenddata');
        const userQuery = query(usersCollectionRef, where('email', '==', currentUser.email));
        const userSnapshot = await getDocs(userQuery);
        const userDataList = userSnapshot.docs.map(doc => doc.data());
        setUserData(userDataList);
        const friendsEmails = userDataList[0]?.Friends || [];
        const friendsQuery = query(usersCollectionRef, where('email', 'in', friendsEmails));
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsDataList = friendsSnapshot.docs.map(doc => doc.data());
        setFriendsList(friendsDataList);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleAddFriend = async () => {
    if (!friendEmail) {
      setError('Please enter a friend\'s email.');
      return;
    }

    try {
      const usersCollectionRef = collection(db, 'backenddata');
      const userQuery = query(usersCollectionRef, where('email', '==', friendEmail));
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        setError('No user found with this email.');
        return;
      }      
      const currentUser = auth.currentUser;        
      const currentUserDocRef = doc(usersCollectionRef, currentUser.uid);
      let currentUserDocSnapshot = await getDoc(currentUserDocRef);
      if (!currentUserDocSnapshot.exists()) {
        console.log(currentUser.uid)
      }
      
      if (currentUserDocSnapshot.exists()) {
        await updateDoc(currentUserDocRef, {
          Friends: arrayUnion(friendEmail)
        });
      } else {
        console.log("User document doesn't exist, skipping adding friend.");
      }

      // Clear input and reset error
      setFriendEmail('');
      setError('');

      // Trigger fetching user data to update friends list
      setFriendsList(prevList => [...prevList, { email: friendEmail }]);

    } catch (error) {
      console.error('Error adding friend:', error);
      setError('An error occurred while adding friend. Please try again.');
    } finally {
    }
  };

  const handleLogOut = async () => {
    try {
      await auth.signOut();
      window.location.reload();

    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePlay = async (friendEmail) => {
    navigate("/play",{
      state: { friendEmail }
  })
  };

  return (
    <div className={styles.container}>
      <Navigationbar />
      <div className={styles.content}>
        {userData && userData.map((user, index) => (
          <div key={index}>
            <h1>Welcome to Chess64, {user.username || 'sign in'}!</h1>
          </div>
        ))}
      </div>
      <div className={styles.user}>
        <h2>User Information</h2>
        {userData && userData.map((user, index) => (
          <div key={index}>
            <p>Email: {user.email}</p>
            <p>Username: {user.username}</p>
          </div>
        ))}
        <div>
          <input
            type="email"
            placeholder="Friend's Email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
          />
          <button className={styles.custombutton} onClick={handleAddFriend}>Add Friend</button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <div>
          <h3>Friends List</h3>
          {friendsList.map((friend, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center' }}>
            
              <p>Email: {friend.email}</p>
<button className={styles.custombutton} onClick={() => handlePlay(friend.email)}>Play</button>

            </div>
          ))}
        </div>
        <div>
          <button className={styles.custombutton} onClick={handleLogOut}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default Home;