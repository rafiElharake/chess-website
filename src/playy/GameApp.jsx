import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, resetGame } from './Game'
import Board from './Board'
import './app.css'
//import Board from '../components/Board/Board'
import { useParams, useNavigate } from 'react-router-dom'
import {  } from 'react-router-dom';
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from '../components/Login/firebase-config'
import { Chess } from "chess.js";

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
          setStatus(game.game.status);
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
  return (
    <div className="app-container">
      {isGameOver && (
        <h2 className="vertical-text">
          GAME OVER
          <button onClick={async () => {
            await resetGame()
            navigate('/')
          }}>
            <span className="vertical-text"> NEW GAME</span>
          </button>
        </h2>
      )}
        <div className="board-container">
        {game.oponent && game.oponent.name && <span className="tag is-link">{game.oponent.name}</span>}
        <Board board={board} position={position} />

        {game.member && game.member.name && <span className="tag is-link">{game.member.name}</span>}
      </div>
      {result && <p className="vertical-text">{result}</p>}
      {status === 'waiting' && (
        <div className="notification is-link share-game">
          <strong>Share this game to continue</strong>
          <br />
          <br />
          <div className="field has-addons">
            <div className="control is-expanded">
              <input type="text" name="" id="" className="input" readOnly value={sharebleLink} />
            </div>
            <div className="control">
              <button className="button is-info" onClick={copyToClipboard}>Copy</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GameApp
