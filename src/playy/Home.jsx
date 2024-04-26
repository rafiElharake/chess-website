import React, { useState } from 'react'
import { auth, db } from '../components/Login/firebase-config'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export default function Home() {
    const { currentUser } = auth
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()
    const newGameOptions = [
        { label: 'Black pieces', value: 'b' },
        { label: 'White pieces', value: 'w' },
        { label: 'Random', value: 'r' },
    ]

    function handlePlayOnline() {
        setShowModal(true)
    }

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
            <div className="columns home">
                <div className="column has-background-primary home-columns">
                    <button className="button is-link" onClick={startLocalGame}>
                        Play Locally
                    </button>
                </div>
                <div className="column has-background-link home-columns">
                    <button className="button is-primary"
                        onClick={handlePlayOnline}>
                        Play Online
                    </button>
                </div>
            </div>
            <div className={`modal ${showModal ? 'is-active' : ''}`}>
                <div className="modal-background"></div>
                <div className="modal-content">
                    <div className="card">
                        <div className="card-content">
                            <div className="content">
                                Please Select the piece you want to start
                            </div>

                        </div>
                        <footer className="card-footer">
                            {newGameOptions.map(({ label, value }) => (
                                <span className="card-footer-item pointer" key={value}
                                    onClick={() => startOnlineGame(value)}>
                                    {label}
                                </span>
                            ))}
                        </footer>
                    </div>
                </div>
                <button className="modal-close is-large" onClick={() => setShowModal(false)}></button>
            </div>
        </>
    )
}