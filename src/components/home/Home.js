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
  const [games, setGames] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let currentUser = auth.currentUser; 
        while (!currentUser) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          currentUser = auth.currentUser; 
                  
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
        //setGames(userDataList[0].games);
        const gamesList = [];
        for(let i=0; i<userDataList[0].games.length;i++){      console.log(userDataList[0].games.length)
        const gameCollectionRef = collection(db, 'games');
        const gameQuery = query(gameCollectionRef, where('game.gameId', '==', userDataList[0].games[i]));
        const querySnapshot = await getDocs(gameQuery);
        querySnapshot.forEach((doc) => {
           // console.log(doc.id, ' => ', doc.data());
            let data =doc.data();
            const gameDetails = `${data.game.members[0].name} vs ${data.game.members[1].name}`;
      gamesList.push(gameDetails);
      console.log(games)
        });

      }  setGames(gamesList);

}
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [games, userData]);

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
  const handleA = async (i) => {
    navigate(`/analysis/${i}`,{
      state: { friendEmail }
  })
  };
  if (!auth.currentUser) {
    return(
      <div>
            <div className={styles.container}>
              <Navigationbar />
              <div className={styles.content}>

     <h1>Welcome to Chess64</h1>
     <a href="/login" className={styles.navbarItem}>
     <button className={styles.custombutton}>Log in</button> </a>
     <h3 style={{ color: '#3D3028' }}>or</h3>
     <a href="/signup" className={styles.navbarItem}>
     <button className={styles.custombutton}>create a new account</button></a>

         
</div></div>
      </div>
    )
  }
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
        <div   style={{ display: 'flex',justifyContent:'center'}}>
          <div>
<div style={{ marginRight:'10px', marginTop:'10px', maxHeight: '340px', overflowY: 'auto' }}>
  <h3>Game History</h3>
  {Array.isArray(games) && games.map((game, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center' }}>
      <p>{game}</p>
      <button className={styles.custombutton}onClick={() => handleA(game)}>analyze</button>
    </div>
  ))}
</div>
</div>
<div>
        <div>          <h3>Friends List</h3>

          <input
            type="email"
            placeholder="Friend's Email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            style={{ width: '60%', margin:'15px' }}/>
          <button className={styles.custombutton} onClick={handleAddFriend}>Add</button>
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <div style={{ marginRight:'10px', marginTop:'10px', maxHeight: '250px', overflowY: 'auto' }}>
          {friendsList.map((friend, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center' }}>
              <p>Email: {friend.email}</p>
<button className={styles.custombutton} onClick={() => handlePlay(friend.email)}>Play</button>
            </div>))}
        </div>
  
        <div>
        </div>

        </div>

        </div>
       <button className={styles.custombutton} onClick={handleLogOut}>Log Out</button>

      </div>
    </div>
  );
};

export default Home;