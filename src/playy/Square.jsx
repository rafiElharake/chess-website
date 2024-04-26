import React from 'react'

export default function Square({ children, black }) {
  console.log('1')
const bgClass = black ? 'square-black' : 'square-white'
console.log('2')

console.log(bgClass)
console.log('3')

  return (
    <div className={`${bgClass} board-square`}>
      {children}
    </div>
  )
}
