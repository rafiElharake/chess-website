/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import Chessboard from "chessboardjsx";

import bishop_black from '../../img/b_b.svg';
import bishop_white from '../../img/b_w.svg';
import king_black from '../../img/k_b.svg';
import king_white from '../../img/k_w.svg';
import knight_black from '../../img/n_b.svg';
import knight_white from '../../img/n_w.svg';
import pawn_black from '../../img/p_b.svg';
import pawn_white from '../../img/p_w.svg';
import queen_black from '../../img/q_b.svg';
import queen_white from '../../img/q_w.svg';
import rook_black from '../../img/r_b.svg';
import rook_white from '../../img/r_w.svg';


const Board = ({ onMove, chess, currFen, side, notation }) => {

    const [, setHistory] = useState([]); // moves history

    const [fen, setFen] = useState(currFen);

    useEffect(() => {
        setFen(currFen);
    }, [currFen])

    const onDrop = ({sourceSquare, targetSquare, side}) => {
        if (chess.moves({ verbose: true }).some(m => m.from === sourceSquare && m.to === targetSquare)) {

      let move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q"
        });
    
        if (move === null) return;

        let history = chess.history({ verbose: true });

        history[history.length - 1].fen = chess.fen();

        setHistory(history);

        onMove(chess.fen(), move);
}
    }

    return (
        <div>
            <Chessboard 
                id="board"
                position={fen}
                onDrop={onDrop}
                width={500}
                undo={true}
                orientation={side}
                showNotation={notation}
                pieces={{
                    wB: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={bishop_white} />
                    ),
                    wP: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={pawn_white} />
                    ),
                    wR: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={rook_white} />
                    ),
                    wN: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={knight_white} />
                    ),
                    wQ: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={queen_white} />
                    ),
                    wK: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={king_white} />
                    ),
                        
                    bB: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={bishop_black} />
                    ),
                    bP: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={pawn_black} />
                    ),
                    bR: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={rook_black} />
                    ),
                    bN: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={knight_black} />
                    ),
                    bQ: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={queen_black} />
                    ),
                    bK: ({ squareWidth, isDragging }) => (
                        <img style={{ width: squareWidth, height: squareWidth }} src={king_black} />
                    ),
                }}
            />
        </div>
    );
};

export default Board;
