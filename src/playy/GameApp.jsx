import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, resetGame } from './Game'
import Board from './Board'
import './app.css'
import styles from '../components/home/Home.module.css'; // Import CSS module for styling
import { useParams, useNavigate } from 'react-router-dom'
import {  } from 'react-router-dom';
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from '../components/Login/firebase-config'
import { Chess } from "chess.js";
import Nav from '../components/nav'

import { handleMove } from './Game';
function GameApp() {
  const [chess] = useState(
    new Chess()
);
const [from, setFrom] = useState(null);
const [to, setTo] = useState(null);
const { id } = useParams();

    const [fen, setFen] = useState(chess.fen());
  const [board, setBoard] = useState([])
  const [isGameOver, setIsGameOver] = useState()
  const [result, setResult] = useState()
  const [position, setPosition] = useState()
  const [initResult, setInitResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [game, setGame] = useState({})
  const navigate = useNavigate()
  const sharebleLink = window.location.href
  useEffect(() => {
    let subscribe
    async function init() {
      let res = initGame(id !== 'local' ? doc(db, `games/${id}`) : null);
      setInitResult(res)
      setLoading(false)


      if (gameSubject) {
        subscribe = gameSubject.subscribe((game) => {
          setBoard(game.board);
          setIsGameOver(game.isGameOver);
          setResult(game.result);
          setPosition(game.position);
          if(id!=='local')setStatus(game.game.status);
          setGame(game);
        });
      } 
      else{
        //console.log('gameSubject not available, retrying...');
        setTimeout(init, 1000); // Retry after 1 second
        return;
    }
    }
    
    init()
    return () => subscribe && subscribe.unsubscribe()
  }, [id,status])

  async function copyToClipboard() {
    await navigator.clipboard.writeText(sharebleLink)
  }
  if (loading) {
    return 'Loading ...'
  }
  if (initResult === 'notfound') {
    return 'Game Not found'
  }

  if (initResult === 'intruder') {
    return 'The game is already full'
  }
  return (<div><Nav />
    <div className="app-container">
      
      {isGameOver && (
        <h2 >
          GAME OVER
          <button className={styles.custombutton}
          onClick={async () => {
            await resetGame()
            navigate('/play')
          }}>
            <span> NEW GAME</span>
          </button>
          {id!=='local' && (
  <button className={styles.custombutton} onClick={() => navigate(`/analysis/${id}`)}>
    <span>analyse</span>
  </button>
)}
        </h2>
      )}
        <div className="board-container">
        {game.oponent && game.oponent.name && <span className="tag is-link">{game.oponent.name}</span>}
        <Board board={board} position={position} />

        {game.member && game.member.name && <span className="tag is-link">{game.member.name}</span>}
      </div>
      {status === 'waiting' && (
  <div style={{   fontSize:"18px",     color: '#3D3028', marginLeft: "18px" }} className="notification is-link share-game">
    <strong>Share this game to continue</strong>
    <br />
    <br />
    <div style={{ display: "flex", alignItems: "center" }}>
      <input
        style={{ fontFamily: "'Aldrich', sans-serif", marginRight: "8px" }}
        type="text"
        name=""
        id=""
        className="input"
        readOnly
        value={sharebleLink}
      />
      <button className={styles.custombutton} onClick={copyToClipboard}>Copy</button>
    </div>
  </div>
)}


    </div></div>
  )
}

export default GameApp
