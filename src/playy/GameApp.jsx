import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, resetGame } from './Game'
import Board from './Board'
import './app.css'
import styles from '../components/home/Home.module.css'; // Import CSS module for styling
import { useParams, useNavigate } from 'react-router-dom'
import {  } from 'react-router-dom';
import { doc, updateDoc, getDoc } from "firebase/firestore"; 
import { db } from '../components/Login/firebase-config'
import { Chess } from "chess.js";
import Nav from '../components/nav'
import { chess as chess2 } from "./Game"
import { gametime } from './Game';
import { gametimeH } from './Home';
import { timeout } from 'rxjs';
export let timeoutt=false;

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
  const [time1, setTime1] = useState({})
  const [winner, setWinner] = useState({})
  const [decisive, setDecisive] = useState(false)

  const [time2, setTime2] = useState({})
  const [resolvedResult, setResolvedResult] = useState(null);
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
          if(id==='local')
          setPosition('w');
          else
          setPosition(game.position);
          if(id!=='local')setStatus(game.game.status);
          setGame(game);
        });
      } 
      else{
        setTimeout(init, 1000); // Retry after 1 second
        return;
    }
    }
    init()
    return () => subscribe && subscribe.unsubscribe()
  }, [id,status])
  useEffect(() => {

if(gametimeH>5)  {
  setTime1(gametimeH)
    setTime2(gametimeH)
}else{setTime1(gametime)
    setTime2(gametime)}  
  }, [status])
  useEffect(() => {
    const whiteTimer = setInterval(() => {
      if(status==='ready'){
        if(game.member.piece){
          if(game.member.piece===chess2.turn()){
      setTime1((prevTime) => prevTime - 0.1);
    }
    else {
      setTime2((prevTime) => prevTime - 0.095);
    }
  }}}, 100);
  return () => clearInterval(whiteTimer);
}, [status]);


useEffect(() => {
  
  if(result) {
    result.then(resolvedResult => {
      setResolvedResult(JSON.stringify(resolvedResult, null, 2));
      if(resolvedResult.includes('WHITE')){
        setDecisive(true)
        if(game.oponent.piece==='w')
        setWinner(game.oponent.name)
        else setWinner(game.member.name)}
      else if(resolvedResult.includes('BLACK')){
        if(game.oponent.piece==='b')
        setWinner(game.oponent.name)
        else setWinner(game.member.name)
      }
      else 
        setWinner('Draw')
      }
    );
  
  async function resu() {
    if(winner===game.oponent.name||winner===game.member.name){
    const userDocRef = doc(db, 'games', id);
    await updateDoc(userDocRef, {
        winner: winner
    });}}
        resu()}
}, [result]);

useEffect(() => {
  if(time1<0){
    timeoutt=true;
    setWinner(game.oponent.name)
  }
  if(time2<0){
    timeoutt=true;
    setWinner(game.member.name)
  }
}, [time1,time2]);

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
            window.location.href = "/play";  
          }}>
            <span> NEW GAME</span>
          </button>
          {id!=='local' && (
  <button className={styles.custombutton} onClick={() => navigate(`/analysis/${id}`)}>
    <span>ANALYSE</span>
  </button>
)}{resolvedResult && decisive && <span>{winner} wins !</span>}
{timeoutt&&winner&& <span>{winner} wins !</span>}
        </h2>
      )}      
      
        <div className="board-container">
        {game.oponent && game.oponent.name && <span className="tag is-link">{game.oponent.name}{game.oponent.piece===chess2.turn()&&`'s turn`} {Math.floor(time2/60)}:{Math.floor(time2)%60}</span>}
        <Board board={board} position={position} />

        {game.member && game.member.name && <span className="tag is-link">{game.member.name+'   '}{game.member.piece===chess2.turn()&&' - your turn  '}{Math.floor(time1/60)}:{Math.floor(time1)%60}</span>}
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
