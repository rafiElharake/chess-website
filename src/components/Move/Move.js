import React from "react";
import styles from "./Move.module.css";
import { zzzz } from "../Stockfish/Stockfish";

const Move = ({ piece, to, onMoveClick, moveNum, raw, isActive,randomColor }) => {
    const moves = raw;
        const evaluation = zzzz[zzzz.length-1];
        let moveColor
        switch (evaluation) {
            case "best move!":
                moveColor="rgb(0, 255, 0, 1)";
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
    

    return (
        <div
            className={styles.move}
            onClick={() => onMoveClick(piece, to, moveNum)}
            style={{ backgroundColor: isActive ? "rgba(61, 48, 40, 0.35)" : "transparent" }}
        >            
                <span style={{ color: randomColor}}>
                    {moves}{" "}
                </span>
           
        </div>
    );
};

export default Move;
