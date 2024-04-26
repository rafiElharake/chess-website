import React from 'react'
import { useDrag, DragPreviewImage } from 'react-dnd'

export default function Piece({
  piece: { type, color },
  position,
}) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'piece', // Specify the type separately from the item
    item: () => ({
      id: `${position}_${type}_${color}`,
    }),
    collect: (monitor) => {
      return { isDragging: !!monitor.isDragging() }
    },
  });
  const pieceImg = require(`../img/${type}_${color}.svg`)
  return (
    <>
      <DragPreviewImage connect={preview} src={pieceImg} />
      <div
        className="piece-container"
        ref={drag}
        style={{ opacity: isDragging ? 0 : 1 }}
      >
        <img src={pieceImg} alt="" className="piece" />
      </div>
    </>
  )
}