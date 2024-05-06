import React, { useState } from 'react'
import { auth, db } from '../components/Login/firebase-config'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import styles from '../components/home/Home.module.css'; // Import CSS module for styling
import Nav from '../components/nav'
export let gametimeH
export default function Home() {
    const { currentUser } = auth
    const navigate = useNavigate()
    const newGameOptions = [
        { label: 'Black pieces', value: 'b' },
        { label: 'White pieces', value: 'w' },
        { label: 'Random', value: 'r' },
    ]
    const time = [
        { label: '15 minutes', value: '15' },
        { label: '10 minutes', value: '10' },
        { label: '5 minutes', value: '1' },
    ]
    const [showModal, setShowModal] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedOptionv, setSelectedOptionv] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedTimev, setSelectedTimev] = useState(null);

    async function startOnlineGame(startingPiece, selectedTime) {
        gametimeH=selectedTime*60;
        const usersCollectionRef = collection(db, 'backenddata');
        const currentUser = auth.currentUser;        
      const currentUserDocRef = doc(usersCollectionRef, currentUser.uid);
      let currentUserDocSnapshot = await getDoc(currentUserDocRef);   
      const username = currentUserDocSnapshot.data().username;
console.log(username);    
        const member = {
            uid: currentUser.uid,
            piece: startingPiece === 'r' ? ['b', 'w'][Math.round(Math.random())] : startingPiece,
            name: username,
            creator: true,
            time: selectedTime*60
        }
        const game = {
            status: 'waiting',
            members: [member],
            gameId: `${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
        }
        setDoc(doc(db, "games", game.gameId), {
            game:game
        })
        navigate(`/game/${game.gameId}`)

    }

    function startLocalGame() {
        navigate('/game/local')
    }
    function handlePlayOnline() {
        setShowModal(true);
    }
    
    return (
        <>
            <div style={{ color: '#3D3028' }}>
                <Nav />
                <div className="column has-background-primary home-columns">
                    <button className={styles.custombutton} onClick={startLocalGame}>
                        Play Locally
                    </button>
                </div>
                <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <button className={styles.custombutton} onClick={handlePlayOnline}>
                        Play Online
                    </button>
                    {showModal && (
                        <div>
    <button className={`${styles.custombutton} ${styles['is-active']}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            {newGameOptions.map(({ label, value }) => (
                <span className={styles.selected} key={value} onClick={() => { setSelectedOption(label); setSelectedOptionv(value); }}>
                    {label}
                </span>
            ))}
        </div>
    </button>
        <button className={`${styles.custombutton} ${styles['is-active']}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            {time.map(({ label, value }) => (
                <span className={styles.selected} key={value}onClick={() => { setSelectedTime(label); setSelectedTimev(value); }}>
                    {label}
                </span>
            ))}
        </div>
    </button><br></br>
    </div>
)}                     {showModal && (
    <button  onClick={() => startOnlineGame(selectedOptionv,selectedTimev)} className={`${styles.custombutton} ${styles['is-active']}`}>
     <div>
         start game<br></br>
         {selectedOption},{selectedTime}
     </div>
 </button>)}

                </div>
            </div>
        </>
    );
    
}
