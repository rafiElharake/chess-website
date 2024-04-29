import React, { useState, useEffect } from 'react';

import styles from './Stockfish.module.css';

import { Chess } from "chess.js";
import { update } from 'firebase/database';

let stockfish = new Worker("/stockfish.js");
export let zzzz = []; // Your evaluations data
    let prevbestLines="exe4"
let evaluations=[]
let movess=[]

export const Stockfish = ({ fen, engineDepth, sendEval, currMove,id }) => {
    const [x, setx] = useState([]); // [0]-best, [1]-second best, [2]-third best

    const [depth, setDepth] = useState(engineDepth);
    const [bestLines, setBestLines] = useState([]); // [0]-best, [1]-second best, [2]-third best
    const [, setBestMove] = useState("");
    const [currEval, setCurrEval] = useState("0");
    const [count, setCount] = useState(0);
    const [timeoutCounter, setTimeoutCounter] = useState(0); // Counter for timeouts

    useEffect(() => {
        setDepth(engineDepth);
    }, [engineDepth])
    useEffect(() => {
            console.log(currMove)
}, [currMove])

    const convertEvaluation = (ev) => {
        const chess = new Chess(`${fen}`);
        const turn = chess.turn();

        if (turn === 'b' && !ev.startsWith('M')) {

            if (ev.startsWith('-')) {
                ev = ev.substring(1);
            } else {
                ev = `-${ev}`;
            }
        }

        return ev;
    }

    useEffect(() => {
        sendEval(currEval);
    }, [sendEval, currEval]);

    useEffect(() => {
        if(currMove){
        prevbestLines=bestLines[0][0]
       if (currMove && bestLines) { 
        let curMove
        if(currMove.san)
        curMove = currMove.san;
        else curMove=currMove
        if(curMove.charAt(curMove.length-1)==='#')
        curMove = curMove.slice(0, -1);
            let test;
            let mev;
            let printed=false
        console.log(curMove)
        if(curMove==='O-O'){
            for(let z=29;z>=0;z--){
                console.log(movess[z].charAt(0))
                if(movess[z].charAt(0)==='K'&&movess[z].charAt(2)==='g')
                test=movess[z]
            console.log(movess[z])

                }
        }
        else if(curMove==='O-O-O'){
            for(let z=29;z>=0;z--){

                if(movess[z].charAt(0)==='K'&&movess[z].charAt(2)==='c')
                test=movess[z]
                }
        }
            else if(curMove.length === 6)
                test = curMove[0] +curMove[1] + curMove[2]+ curMove[3];
            else if (curMove.length === 2){
                test = curMove[0] + 'x'+curMove[0] + curMove[1];  
            }
            else if (curMove.length === 3&&curMove!=='O-O'){
                test = curMove[0] + 'x'+curMove[1] + curMove[2];  
            }
            else
                test = curMove;
                console.log(test, evaluations,movess)
            for(let i=0;i<30;i++){
                if (test === movess[i]) {
                    if(i===0){printed=true
                        zzzz[count]='best move!'}
                     if(!printed&&((Math.abs(evaluations[i]-evaluations[0])<50))){
                            zzzz[count]='great move'
                            printed=true
                    }
                    if(!printed&&((Math.abs(evaluations[i]-evaluations[0])<100))){
                        zzzz[count]='good move'
                        printed=true
                }
                if(!printed&&((Math.abs(evaluations[i]-evaluations[0])<200))){
                    zzzz[count]='inaccurate move'
                    printed=true
            }
            if(!printed&&((Math.abs(evaluations[i]-evaluations[0])<300))){
                zzzz[count]='bad move'
                printed=true
        }
                    
            }else{
                if(i>18&&!printed)zzzz[count]='blunder'
            }
        }
                setCount(count+1)
       }}

    }, [timeoutCounter]);

    useEffect(() => {
let bestLinesCopy
        let timeoutId;
                    setTimeoutCounter(timeoutCounter => timeoutCounter + 1);
        const handleTimeout = () => {
            stockfish.terminate();
        };
    
        stockfish.terminate();
        stockfish = new Worker("/stockfish.js");
        stockfish.postMessage("uci");
        stockfish.postMessage("ucinewgame");
        stockfish.postMessage("setoption name MultiPV value 50");
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage(`go depth ${depth}`);
        stockfish.onmessage = function(event) {
            try {
                if (event.data.startsWith(`info depth`)) {
                    let message = event.data.split(' ');
    
                    let index = 0;
                    let movesIndex = 0;
    
                    let moves = [];
    
                    let evalutaion = "0";
    
                    for (let i = 0; i < message.length; i ++) {
                        if (message[i] === 'multipv') {
                            index = parseInt(message[i + 1]) - 1;
                        }
                        for(let j=0; j<30; j++){
                            if(message[i] === 'score' && message[i + 1] === 'cp' && index === j)
                            evaluations[j]=(message[i + 2])
                        }
                        if (message[i] === 'score' && message[i + 1] === 'cp' && index === 0) {
                            evalutaion = message[i + 2];
                            setCurrEval(convertEvaluation(evalutaion));
                        }
    
                        else if (message[i] === 'score' && index === 0) {
                            evalutaion = 'M' + message[i + 2];
                            setCurrEval(convertEvaluation(evalutaion));
                        }
    
    
                        if (message[i] === 'pv') {
                            movesIndex = i + 1;
                            break;
                        }
    
                    }
    
                    for (let i = movesIndex; i < message.length; i ++) {
                        if (message[i] === 'bmc') break;
                        moves.push(message[i]);
                    }
                     bestLinesCopy = bestLines;
                    if(!(moves.includes("mate")))
                    bestLinesCopy[index] = convertStockfishLine(moves);
                    for(let j=0; j<30; j++){
                        movess[j]=(bestLines[j][0])
                    }

                }
    
                if (event.data.startsWith("bestmove")) {
                    let message = event.data.split(' ');
                    setBestMove(message[1]);
                }
            } catch (error) {
            }
        };
        
    // Set timeout to terminate Stockfish after 3 seconds
    timeoutId = setTimeout(handleTimeout, 3000);

    // Clean up function to clear the timeout when component unmounts or useEffect runs again
    return () => {
        clearTimeout(timeoutId);
    };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fen, depth, currMove]);
    
    const convertStockfishLine = line => {
        const chess2 = new Chess(`${fen}`);

        const convertedLine = [];

        for (let i = 0; i < line.length; i ++) {

            const move = line[i];

            const from = move[0] + move[1];
            const to = move[2] + move[3];

            if (chess2.get(from) === null) {
                break;
            }

            const piece = chess2.get(from).type;
            const piece2 = chess2.get(to);

            let convertedMove = "";

            if (piece === 'p') {
                if (piece2 === null) {
                    convertedMove += to;
                } else {
                    convertedMove += `${move[0]}x${to}`
                }
            } else {
                if (piece2 === null) {
                    convertedMove += piece.toUpperCase() + to;
                } else {
                    convertedMove += `${piece.toUpperCase()}x${to}`
                }
            }

            convertedLine.push(convertedMove);

            chess2.move(from + to, { sloppy: true });

        }

        return convertedLine;

    }


    return (
        <div className={styles.bestLines}>
 {bestLines&&bestLines.slice(0, 3).map((bestLine, index) => (
                <div className={styles.bestLine} key={index}>
                {bestLine.map((bestMove, subIndex) => (
                    <div className={styles.bestMove} key={subIndex}>
                        {bestMove}
                    </div>    
                ))}
            </div>
        ))}
    </div>
    )

}

