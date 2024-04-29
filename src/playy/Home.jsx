import React, { useState } from 'react'
import { auth, db } from '../components/Login/firebase-config'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import styles from '../components/home/Home.module.css'; // Import CSS module for styling
import Nav from '../components/nav'
export default function Home() {
    const { currentUser } = auth
    const navigate = useNavigate()
    const newGameOptions = [
        { label: 'Black pieces', value: 'b' },
        { label: 'White pieces', value: 'w' },
        { label: 'Random', value: 'r' },
    ]


    async function startOnlineGame(startingPiece) {
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
            creator: true
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

    return (
        <>
            <div style={{ color: '#3D3028' }}>
                <Nav />
                <div className="column has-background-primary home-columns">
                    <button className={styles.custombutton} onClick={startLocalGame}>
                        Play Locally
                    </button>
                </div>
                <div className="column has-background-link home-columns">
                    <button className={styles.custombutton}>
                        Play Online
                   
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <div >
                                Please Select the piece you want to start
                            </div>
                            { newGameOptions.map(({ label, value }) => (
                                <span  key={value}
                                    onClick={() => startOnlineGame(value)}>
                                    {label}
                                </span>
                            ))}
                </div> </button>
                </div>
            </div>
        </>
    )
}
