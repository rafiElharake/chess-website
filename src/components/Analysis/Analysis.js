import React, { useEffect, useState,useRef } from "react";
import Board from '../Board/Board';
import Move from '../Move/Move';
import { useParams, useNavigate } from 'react-router-dom'
import SubAnalysisMove from '../SubAnalysisMove/SubAnalysisMove';
import {Stockfish} from '../Stockfish/Stockfish';
import MenuButtons from '../MenuButtons/MenuButtons';
import LoadGamePopup from '../LoadGamePopup/LoadGamePopup';
import SettingsPopup from '../SettingPopup/SettingsPopup';
import CurrAnalysisPopup from '../CurrAnalysisPopup/CurrAnalysisPopup';
import EvalBar from '../EvalBar/EvalBar';
import styles from './Analysis.module.css';
import { Chess } from "chess.js";
import parser from '@chess-fu/pgn-parser'
import Chart from "chart.js/auto";
import Navigationbar from '../nav'
import { move } from "../../playy/Game";
import { zzzz } from "../Stockfish/Stockfish";
import { auth } from '../Login/firebase-config'
import { fromRef } from 'rxfire/firestore'
import { db } from '../Login/firebase-config'
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
const pgnParser = new parser();
const Analysis = () => {

    const [chess] = useState(
        new Chess()
    );
    const { id } = useParams();
    const [fen, setFen] = useState(chess.fen());

    const [analysisPGN, setAnalysisPGN] = useState("");
    const [ths, setThs] = useState("");

    const [orientation, setOrientation] = useState('white');

    const [currMove, setCurrMove] = useState({
        moveNum: 0,
        ravNumber: [],
        whichRav: []
    });

    const [isLoadActive, setLoadActive] = useState(false);
    const [isSettingsActive, setSettingsActive] = useState(false);
    const [isCurrAnalysisActive, setCurrAnalysisActive] = useState(false);

    const [depth, setDepth] = useState(30);

    const [notation, setNotation] = useState(true);

    const [evalutaion, setEvaluation] = useState("0");

    const [engineStarted, setEngineStarted] = useState(true);

    useEffect(() => {
        chess.header('White', 'unknown')
        chess.header('Black', 'unknown')
    }, [chess]);
    useEffect(() => {
        if(id){
            loadPGN()
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
    
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
        };
    });

    const getEvalFromEngine = evalu => {
        setEvaluation(evalu);
    }

    const handleKeyDown = e => {

        if (e.keyCode === 37 || e.keyCode === 39) {

            const parsed = pgnParser.parse(analysisPGN);

            const headers = parsed[0] ? parsed[0].headers : []; 
            let moves = parsed[0] ? parsed[0].history : [];

            moves = clearParsedMoves(moves);

            const parsedMoves = [];

            for (let i = 0; i < currMove.ravNumber.length; i ++) {

                let moveCounter = 0;
                
                for (let j = 0; j < moves.length; j ++) {

                    if (moves[j].piece != null) {
                        
                        moveCounter++;

                        if (currMove.ravNumber[i] === moveCounter) {
                            moves = moves[j + (currMove.whichRav[i] - 1)].rav;
                            break;
                        }

                        parsedMoves.push(moves[j].raw);

                    }

                }

            }

            let moveCounter = 0;

            let prevMove = null;

            for (let i = 0; i < moves.length; i ++) {

                if (moves[i].piece != null) {

                    moveCounter ++;
                    parsedMoves.push(moves[i].raw);
                    
                    if (moveCounter === currMove.moveNum) {
                        
                        const nextMove = findNextMove(moves, i);

                        if (e.keyCode === 39 && nextMove != null) {
                            parsedMoves.push(nextMove);
                            moveCounter ++;
                            
                        }

                        if (e.keyCode === 37 && prevMove != null) {
                            parsedMoves.pop();
                            moveCounter --;
                        }

                        break;
                    }

                    prevMove = moves[i].raw;

                }

            }

            let newPgn = createPGN(headers, parsedMoves);

            if (chess.loadPgn(newPgn)) {
                setFen(chess.fen());
                setCurrMove({
                    moveNum: moveCounter,
                    ravNumber: currMove.ravNumber,
                    whichRav: currMove.whichRav
                });
                
            } 

        }

    }

    const findNextMove = (moves, index) => {

        for (let i = index + 1; i < moves.length; i ++) {

            if (moves[i].piece != null) {
                return moves[i].raw;
            }

        }

        return null;

    }

     const loadPGN = async (pgn) => {
        if(id){
        const docRef = collection(db, 'games');
        const gameQuery = query(docRef, where('game.gameId', '==', id));
        const querySnapshot =await getDocs(gameQuery);
        const existingData = querySnapshot.docs[0].data();
        let moves=existingData.pgn
    let formattedPGN = '';
for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
        formattedPGN += `${Math.floor(i / 2) + 1}. `;
    }
    formattedPGN += `${moves[i]} `;
    if ((i + 1) % 2 === 0) {
        formattedPGN += '\n';
    }
}
pgn=formattedPGN}
            setFen(chess.fen());
            setAnalysisPGN(pgn);
            setLoadActive(false);
       
    }

    const addHeadersToPGN = (headers) => {
        let newPgn = "";

        headers.forEach(header => {
            newPgn += `[${header.name} "${header.value}"]\n`;
        });

        newPgn += "\n";

        return newPgn;
    }
    const showNextMove = () => {
        // Check if analysisPGN is undefined or empty
        if (!analysisPGN || analysisPGN.trim() === '') {
            return; // Do nothing if analysisPGN is not available
        }
    
        const parsed = pgnParser.parse(analysisPGN);
        
        // Check if parsed result is undefined or empty
        if (!parsed || parsed.length === 0 || !parsed[0].headers || !parsed[0].history) {
            return; // Do nothing if parsed result is not as expected
        }
    
        const headers = parsed[0].headers;
        const moves = parsed[0].history;
        let moveNumberOverall = 1;
        const parsedMoves = [];
    
        for (let i = 0; i < moves.length; i ++) {
            if (moves[i].piece != null) {
                const move = moves[i];
                parsedMoves.push(move.raw);
                if (moveNumberOverall === currMove.moveNum + 1) { // Move to the next move
                    break;
                }
                moveNumberOverall ++;

            }
        }
    
        // Check if there are any more moves available
        if (currMove.moveNum >= moves.length) {
            return; // Do nothing if there are no more moves
        }
    
        let newPgn = createPGN(headers, parsedMoves);
        chess.loadPgn(newPgn);
        setFen(chess.fen());
        setCurrMove({
            moveNum: currMove.moveNum + 1, // Increment move number to view the next move
            ravNumber: [],
            whichRav: []
        });if (newPgn) {
            console.log(newPgn)
            const movess = newPgn.split(/\s+/);
            if (movess) {
                console.log(movess)
                const lastMove = movess[movess.length - 2];
                console.log("Last move:", lastMove);
            console.log(lastMove)      
        setThs(lastMove)} 
        
        }
    }
    
    const showPrevMove = () => {
        // Check if analysisPGN is undefined or empty
        if (!analysisPGN || analysisPGN.trim() === '') {
            return; // Do nothing if analysisPGN is not available
        }
    
        const parsed = pgnParser.parse(analysisPGN);
    
        // Check if parsed result is undefined or empty
        if (!parsed || parsed.length === 0 || !parsed[0].headers || !parsed[0].history) {
            return; // Do nothing if parsed result is not as expected
        }
    
        const headers = parsed[0].headers;
        const moves = parsed[0].history;
        let moveNumberOverall = 1;
        const parsedMoves = [];
        let prevMove = null;
    
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].piece != null) {
                const move = moves[i];
                parsedMoves.push(move.raw);
                if (moveNumberOverall === currMove.moveNum - 1) { // Move to the previous move
                    prevMove = move.raw;
                    break;
                }
                moveNumberOverall++;
                prevMove = move.raw;
            }
        }
    
        // Check if there is no previous move available
        if (prevMove === null) {
            return; // Do nothing if there is no previous move
        }
    
        let newPgn = createPGN(headers, parsedMoves);
        chess.loadPgn(newPgn);
        setFen(chess.fen());
        setCurrMove({
            moveNum: currMove.moveNum - 1, // Decrement move number to view the previous move
            ravNumber: [],
            whichRav: []
        });
    };
    
    

    const moveHistoryPress = (piece, to, moveNum) => {
        const parsed = pgnParser.parse(analysisPGN);

        const headers = parsed[0].headers;
        const moves = parsed[0].history;

        let moveNumberOverall = 1;

        const parsedMoves = [];

        for (let i = 0; i < moves.length; i ++) {
            
            if (moves[i].piece != null) {
                
                const move = moves[i];

                parsedMoves.push(move.raw);
               
                if (moveNumberOverall === moveNum) {
                    break;
                }

                moveNumberOverall ++;
            }

        }

        let newPgn = createPGN(headers, parsedMoves);
            chess.loadPgn(newPgn)
            setFen(chess.fen());
            setCurrMove({
                moveNum,
                ravNumber: [],
                whichRav: []
            });
    }

    const onSubAnalysisPress = (piece, to, moveNum, ravNumber, whichRav) => {

        const parsed = pgnParser.parse(analysisPGN);

        const headers = parsed[0].headers;
        let moves = parsed[0].history;

        const parsedMoves = [];

        let depth = 0;

        for (let i = 0; i < ravNumber.length; i ++) {
            let moveCounter = 0;
            
            for (let j = 0; j < moves.length; j ++) {

                if (moves[j].piece != null) {
                    
                    moveCounter++;

                    if (ravNumber[i] === moveCounter) {
                        moves = moves[j + (whichRav[depth] - 1)].rav;
                        depth ++;

                        if (i === ravNumber.length - 1) {
                            // check which rav
                            // moves = moves[j + (whichRav - 1)].rav;

                            // loop through last rav
                            moveCounter = 0;
                            for (let k = 0; k < moves.length; k ++) {

                                if (moves[k].piece != null) {
                                    moveCounter ++;

                                    parsedMoves.push(moves[k].raw);

                                    if (moveCounter === moveNum) {
                                        setCurrMove({
                                            moveNum,
                                            ravNumber,
                                            whichRav
                                        });
                                        break;
                                    }
                                }
                            }

                        }

                        break;
                    }

                    parsedMoves.push(moves[j].raw);

                }

            }

        }

        let newPgn = createPGN(headers, parsedMoves);

            chess.loadPgn(newPgn)
            setFen(chess.fen());
            setCurrMove({
                moveNum,
                ravNumber,
                whichRav
            });

    }

    const loadSubAnalysis = (moves, ravNumber, whichRav) => {

        let moveNumber = 1;
        let numberTimes = 0;
        let add = false;

        let moveNumberOverall = 1;

        let subAn = [];

        let whichRavNum = 1;

        for (let i = 0; i < moves.length; i ++) {
            const move = moves[i];
            
            if (moves[i].piece != null) {

                let isActive = false;

                if (numberTimes === 0) {
                    subAn.push(<div>{moveNumber}</div>);
                    add = true;
                }

                if (numberTimes === 1) {
                    moveNumber ++;
                    numberTimes = 0;
                }

                if (add) {
                    numberTimes = 1;
                    add = false;
                }

                if (currMove.moveNum === moveNumberOverall && 
                    JSON.stringify(currMove.ravNumber) === JSON.stringify(ravNumber) && 
                    JSON.stringify(currMove.whichRav) === JSON.stringify(whichRav)) {
                    isActive = true;
                }

                subAn.push(
                    <SubAnalysisMove
                        piece={move.piece}
                        to={move.to}
                        ravNumber={ravNumber}
                        raw={move.raw}
                        moveNumberOverall={moveNumberOverall}
                        onSubAnalysisPress={onSubAnalysisPress}
                        whichRav={whichRav}
                        isActive={isActive}
                    />
                )

                if (move.rav) {
                    //subanalysis
                    const sub = loadSubAnalysis(move.rav, [...ravNumber, moveNumberOverall], [...whichRav, whichRavNum]);
                    subAn.push(<div className={styles.subAnalysisInside}>({sub})</div>);
                }

                moveNumberOverall ++;
            }

            if (!move.piece && move.rav) {
                whichRavNum ++;
                const sub = loadSubAnalysis(move.rav, [moveNumberOverall - 1], [...whichRav, whichRavNum]);
                subAn.push(<div className={styles.subAnalysis}>({sub})</div>);
            }

        }

        return subAn;

    }

    const createPGN = (headers, moves) => {
        let newPgn = addHeadersToPGN(headers);

        let moveNumber = 1;
        let numberTimes = 0;
        let add = false;

        for (let i = 0; i < moves.length; i ++) {
            
            if (numberTimes === 0) {
                newPgn += `${moveNumber}. `;
                add = true;
            }

            if (numberTimes === 1) {
                moveNumber ++;
                numberTimes = 0;
            }

            if (add) {
                numberTimes = 1;
                add = false;
            }

            newPgn += `${moves[i]} `;

        }

        return newPgn;
        
    }

    const createPGNWithSubRec = (pgn, moves, moveNumber, numberTimes, add, isSub) => {

        if (isSub) {
            const isBlack = numberTimes === 0;
            moveNumber = isBlack ? moveNumber - 1 : moveNumber;

            if (isBlack) {
                pgn += `(${moveNumber}... `;
                numberTimes = 1;
            } else {
                pgn += `(`;
                numberTimes = 0;
            }

        }

        for (let i = 0; i < moves.length; i ++) {

            if (moves[i].piece != null) {
                if (numberTimes === 0) {
                    pgn += `${moveNumber}. `;
                    add = true;
                }

                if (numberTimes === 1) {
                    moveNumber ++;
                    numberTimes = 0;
                }

                if (add) {
                    numberTimes = 1;
                    add = false;
                }

                pgn += `${moves[i].raw} `;
            }

            if (moves[i].rav) {
                pgn = createPGNWithSubRec(pgn, moves[i].rav, moveNumber, numberTimes, add, true);
            }

        }

        if (isSub) pgn += ") ";

        return pgn
    }

    const createPGNWithSub = (headers, moves) => {

        let pgn = addHeadersToPGN(headers);

        let moveNumber = 1;
        let numberTimes = 0;
        let add = false;

        pgn = createPGNWithSubRec(pgn, moves, moveNumber, numberTimes, add, false);

        return pgn;

    }

    const addMove = (moves, newMove) => {

        let moveNumberOverall = 0;

        for (let i = 0; i < currMove.ravNumber.length; i ++) {

            for (let j = 0; j < moves.length; j ++) {
                if (moves[j].piece != null) {
                    moveNumberOverall ++;

                    if (currMove.ravNumber[i] === moveNumberOverall) {
                        moves = moves[j + currMove.whichRav[i] - 1].rav;
                        moveNumberOverall = 0;
                        break;
                    }

                }

            }

        }

        let newCurr = currMove;

        for (let i = 0; i < moves.length; i ++) {

            if (moves[i].piece != null) {
                moveNumberOverall ++;

                if (currMove.moveNum === moveNumberOverall) {
                    //we found curr move :D

                    let newMoveObj = {
                        piece: newMove.piece.toUpperCase(),
                        to: newMove.to,
                        raw: `${newMove.san}`
                    }

                    if (i === moves.length - 1) {
                        moves[i + 1] = newMoveObj;
                        newCurr = {
                            moveNum: currMove.moveNum + 1,
                            ravNumber: currMove.ravNumber,
                            whichRav: currMove.whichRav
                        }
                    } else {

                        //check if there is a raw with that move in db
                        if (moves[i + 1].raw === newMoveObj.raw) {
                            newCurr = {
                                moveNum: currMove.moveNum + 1,
                                ravNumber: currMove.ravNumber,
                                whichRav: currMove.whichRav
                            }
                        } else {

                            let exists = false;

                            let k = i + 1;
                            for (let k = i + 1; k < moves.length; k ++) {
                                if (!moves[k].rav) {
                                    break;
                                } else {
                                    if (moves[k].rav[0].raw === newMoveObj.raw) {
                                        exists = true;
                                    }
                                }
                            }

                            if (!exists) {
                                if (moves[i + 1].rav) {
                                    //po k nowy elem
                                    insertAt(moves, k + 1, {rav: [newMoveObj]});
                                    newCurr = {
                                        moveNum: 1,
                                        ravNumber: [...currMove.ravNumber, currMove.moveNum + 1],
                                        whichRav: [...currMove.whichRav, k + 1]
                                    }
                                } else {
                                    moves[i + 1].rav = [newMoveObj]
                                    newCurr = {
                                        moveNum: 1,
                                        ravNumber: [...currMove.ravNumber, currMove.moveNum + 1],
                                        whichRav: [...currMove.whichRav, 1]
                                    }
                                }
                            }

                        }

                    }

                    break;

                }

            }

        }

        return newCurr;


    }

    function insertAt(array, index, element) {
        array.splice(index, 0, element);
    }

    const clearParsedMoves = (moves) => {

        const cleared = [];

        for (let i = 0; i < moves.length; i ++) {
            if (moves[i].piece != null || moves[i].rav != null) {
                cleared.push(moves[i]);
            }
        }

        return cleared;
        
    }

    const onMove = (fen, move) => {
setThs(move)
        const parsed = pgnParser.parse(analysisPGN);

        let newAnalysisPGN;

        if (!parsed[0]) {
            newAnalysisPGN = `1. ${move.san}`
            setCurrMove({
                moveNum: 1,
                ravNumber: [],
                whichRav: []
            });

        } else {
            const headers = parsed[0] ? parsed[0].headers : []; 
            let moves = parsed[0] ? parsed[0].history : [];

            const cleared = clearParsedMoves(moves);
            
            const newCurr = addMove(cleared, move);
            newAnalysisPGN = createPGNWithSub(headers, cleared);
            setCurrMove(newCurr);
        }

        setAnalysisPGN(newAnalysisPGN);
        setFen(fen);

    }

    const backgroundLoadExit = (e, modal) => {
        if (e.target === modal.current) {
            setLoadActive(false);
        }
    }

    const backgroundSettingsExit = (e, modal) => {
        if (e.target === modal.current) {
            setSettingsActive(false);
        }
    }

    const backgroundCurrAnalysisExit = (e, modal) => {
        if (e.target === modal.current) {
            setCurrAnalysisActive(false);
        }
    }

    const resetBoard = () => {
        setAnalysisPGN("");
        setCurrMove({
            moveNum: 0,
            ravNumber: [],
            whichRav: []
        });
        chess.reset();
        setFen(chess.fen());
    }

    const flipBoard = () => {
        if (orientation === 'white') {
            setOrientation('black');
        } else {
            setOrientation('white');
        }
    }

    const getCurrPlayer = () => {
        return chess.turn();
    }

    let moveNumber = 1;
    let numberTimes = 0;
    let add = false;

    let moveNumberOverall = 1;
    let whichRav = 1;


        const chartRef = useRef(null);
        const evaluationHistory = useRef([]);
        const debounceThreshold = 500;
        const timeoutId = useRef(null);
        useEffect(() => {
            clearTimeout(timeoutId.current);
        
            timeoutId.current = setTimeout(() => {
                if (chartRef.current && chartRef.current.chartInstance) {
                    chartRef.current.chartInstance.destroy();
                }
                evaluationHistory.current.push({ moveNumber, evalutaion });
        
                const ctx = chartRef.current.getContext("2d");
                const labels = evaluationHistory.current.map(entry => entry.moveNumber);
                const data = evaluationHistory.current.map(entry => entry.evalutaion / 100);
        
                const newChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Evaluation",
                                data,
                                borderColor: "rgb(61,48,40)",
                                backgroundColor: "rgb(61,48,40,0.3)",
                                fill: true,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "Move Number",
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Evaluation",
                                },
                            },
                        },
                    },
                });
                chartRef.current.chartInstance = newChart;
                return () => {
                    newChart.destroy();
                };
            }, debounceThreshold);
            return () => clearTimeout(timeoutId.current);
        }, [evalutaion, moveNumber]);


    return (
        <div>
        <Navigationbar/>

        <div className={styles.container}>

            <LoadGamePopup
                isActive={isLoadActive}
                setLoadActive={setLoadActive}
                loadPGN={loadPGN}
                backgroundLoadExit={backgroundLoadExit}
            />

            <SettingsPopup
                isActive={isSettingsActive}
                setSettingsActive={setSettingsActive}
                backgroundSettingsExit={backgroundSettingsExit}
                depth={depth}
                setDepth={setDepth}
                notation={notation}
                setNotation={setNotation}
            />

            <CurrAnalysisPopup
                isActive={isCurrAnalysisActive}
                setActive={setCurrAnalysisActive}
                backgroundCurrAnalysisExit={backgroundCurrAnalysisExit}
                analysisPGN={analysisPGN}
            />

            {engineStarted && 
                <div style={{ height: '450px' }}>
                    <EvalBar
                        evaluation={evalutaion}
                        getCurrPlayer={getCurrPlayer}
                    />
                </div>
            }

            <Board
                onMove={onMove}
                chess={chess}
                currFen={fen}
                side={orientation}
                notation={notation}
            />

            <div className={styles.menu}>

                <MenuButtons
                    setLoadActive={setLoadActive}
                    showNextMove={showNextMove}
                    showPrevMove={showPrevMove}
                    resetBoard={resetBoard}
                    flipBoard={flipBoard}
                    setSettingsActive={setSettingsActive}
                    setCurrAnalysisActive={setCurrAnalysisActive}
                    evaluation={evalutaion}
                    setEngineStarted={setEngineStarted}
                    engineStarted={engineStarted}
                    moveNum={moveNumberOverall}
                />

<div style={{
            maxWidth: '400px',
            overflow: 'auto',
            marginLeft: '100px',
        }} >
<canvas ref={chartRef} id="evaluationChart" />
</div>
                {engineStarted && 
                    <Stockfish
                        fen={fen}
                        engineDepth={depth}
                        sendEval={getEvalFromEngine}
                        currMove={ths}
                        {...(id && { id })}
                        moveNum={moveNumberOverall}
                    />
                }

                <div className={styles.history}>
                    {analysisPGN !== '' &&
                        pgnParser.parse(analysisPGN)[0].history.map((move, i) => {
                            let returnedComp = [];

                            if (move.piece != null) {

                                whichRav = 1;

                                let isActive = false;

                                if (numberTimes === 0) {
                                    returnedComp.push(
                                        <div className={styles.moveNum} key={moveNumber}>
                                            {moveNumber}.
                                        </div>
                                    )
                                    add = true;
                                }
                
                                if (numberTimes === 1) {
                                    moveNumber ++;
                                    numberTimes = 0;
                                }
                
                                if (add) {
                                    numberTimes = 1;
                                    add = false;
                                }

                                if (currMove.moveNum === moveNumberOverall && currMove.ravNumber.length === 0) {
                                    isActive = true;
                                }
                                const evaluation = zzzz[moveNumberOverall-1];
                                let moveColor
                                switch (evaluation) {
                                    case "best move!":
                                        moveColor="rgb(0, 255, 0, 1)";
                                        break;
                                        case "great move":
                                            moveColor="rgb(255, 0, 255, 1)";
                                            break;
                                    case "good move":
                                        moveColor="rgb(0, 0, 255, 1)";
                                        break;
                                    case "inaccurate move":
                                        moveColor="rgb(255, 165, 0, 1)";
                                        break;
                                    case "bad move":
                                        moveColor="rgb(140, 0, 50, 1)";
                                        break;
                                    case "blunder":
                                        moveColor="rgb(255, 0, 0, 1)";
                                        break;
                                    default:
                                        moveColor="inherit"; 
                                }
                                returnedComp.push( 
                                    <Move
                                        key={moveNumber + move.piece + move.to}
                                        onMoveClick={moveHistoryPress}
                                        piece={move.piece}
                                        to={move.to}
                                        moveNum={moveNumberOverall}
                                        raw={move.raw}
                                        isActive={isActive}
                                        randomColor= {moveColor}
                                        
                                    />
                                );

                                if (move.rav) {
                                    //subanalysis
                                    const sub = loadSubAnalysis(move.rav, [moveNumberOverall], [whichRav]);
                                    returnedComp.push(<div className={styles.subAnalysis}>({sub})</div>);
                                }

                                moveNumberOverall ++;

                            }

                            if (!move.piece && move.rav) {
                                whichRav ++;
                                const sub = loadSubAnalysis(move.rav, [moveNumberOverall - 1], [whichRav]);
                                returnedComp.push(<div className={styles.subAnalysis}>({sub})</div>);
                            }

                            return ( 
                                returnedComp
                            );
                        })
                    }
                </div>
<div>
                        <br></br>
                    <span style={{ color: 'rgb(0, 255, 0)' }}>best move!-</span>
                    <span style={{ color: 'rgb(255, 0, 255)' }}>great move-</span>
                    <span style={{ color: 'rgb(0, 0, 255)' }}>good move-</span>
                    <span style={{ color: 'rgb(255, 165, 0, 1)' }}>inaccurate move-</span>
                    <span style={{ color: 'rgb(140, 0, 50)' }}>bad move-</span>
                    <span style={{ color: 'rgb(255, 0, 0)' }}>blunder</span>
                </div>









            </div>

        </div></div>
    );
};

export default Analysis;