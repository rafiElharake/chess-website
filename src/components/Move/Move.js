import React from "react";
import styles from "./Move.module.css";
import { zzzz } from "../Stockfish/Stockfish";

const Move = ({ piece, to, onMoveClick, moveNum, raw, isActive }) => {
    const moves = raw.split(" ");
    const moveColors = [];
    moves.forEach((move, index) => {
        const evaluation = zzzz[zzzz.length-1];
        console.log(evaluation)
        switch (evaluation) {
            case "best move!":
                moveColors.push("rgb(0, 255, 0, 1)");
                break;
            case "good move":
                moveColors.push("rgb(0, 0, 255, 1)");
                break;
            case "inaccurate move":
                moveColors.push("rgb(255, 165, 0, 1)");
                break;
            case "bad move":
                moveColors.push("rgb(140, 0, 50, 1)");
                break;
            case "blunder":
                moveColors.push("rgb(255, 0, 0, 1)");
                break;
            default:
                moveColors.push("inherit"); 
        }
    });

    return (
        <div
            className={styles.move}
            onClick={() => onMoveClick(piece, to, moveNum)}
            style={{ backgroundColor: isActive ? "rgba(61, 48, 40, 0.35)" : "transparent" }}
        >
            {/* Render each move with its corresponding color */}
            {moves.map((move, index) => (
                <span key={index} style={{ color: moveColors[index] }}>
                    {move}{" "}
                </span>
            ))}
        </div>
    );
};

export default Move;
