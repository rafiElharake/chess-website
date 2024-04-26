import React, { useState, useEffect } from 'react';

import styles from './Stockfish.module.css';

import { Chess } from "chess.js";

let stockfish = new Worker("/stockfish.js");
export let zzzz = []; // Your evaluations data

export const Stockfish = ({ fen, engineDepth, sendEval, currMove }) => {

    const [depth, setDepth] = useState(engineDepth);
    const [bestLines, setBestLines] = useState([]); // [0]-best, [1]-second best, [2]-third best
    const [, setBestMove] = useState("");
    const [currEval, setCurrEval] = useState("0");
    const [count, setCount] = useState(0);
    useEffect(() => {
        setDepth(engineDepth);
    }, [engineDepth])

    const convertEvaluation = (ev) => {
        // console.log(ev);
        const chess = new Chess(`${fen}`);
//console.log(curMove)
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
       if (currMove && bestLines) { 
        console.log(bestLines)
            let curMove = currMove.san;
            let test;
            let printed = false;
            if (curMove.length === 2)
                test = curMove[0] + curMove[0] + curMove[1];  
            else
                test = curMove;
            
            for (let i = 0; i <= 10; i++) {
                if (test[0] + 'x' + test[1] + test[2] === bestLines[i][0]&&!printed) {
                    if(i===0){zzzz[count]="best move!"
                    printed = true;}
                    else if(0<i&&i<4){zzzz[count]="good move"
                    printed = true; }
                    else if(3<i&&i<7){zzzz[count]="inaccurate move"
                    printed = true; }
                    else if(6<i&&i<10){zzzz[count]="bad move"
                    printed = true; }
                    setCount(count+1)
                }
                else if(i>9&&!printed){
                    zzzz[count]="blunder"
                printed=true
                setCount(count+1)
                } 

            }
        }
    }, [currMove]);

    useEffect(() => {
        stockfish.terminate();
        stockfish = new Worker("/stockfish.js");
        stockfish.postMessage("uci");
        stockfish.postMessage("ucinewgame");
        stockfish.postMessage("setoption name MultiPV value 11");
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage(`go depth ${depth}`);
        stockfish.onmessage = function(event) {
            // console.log(event.data ? event.data: event);
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

                    if (message[i] === 'score' && message[i + 1] === 'cp' && index === 0) {
                        evalutaion = message[i + 2];
                        setCurrEval(convertEvaluation(evalutaion));
                        //console.log(evalutaion);
                    }

                    else if (message[i] === 'score' && index === 0) {
                        evalutaion = 'M' + message[i + 2];
                        setCurrEval(convertEvaluation(evalutaion));
                        //console.log(evalutaion);
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

                const bestLinesCopy = bestLines;
                //console.log(moves)
                if(!(moves.includes("mate")))
                bestLinesCopy[index] = convertStockfishLine(moves);
                setBestLines(bestLinesCopy);
            }

            if (event.data.startsWith("bestmove")) {
                let message = event.data.split(' ');
                setBestMove(message[1]);
            }
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
 {bestLines.slice(0, 3).map((bestLine, index) => (
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

