import { Chess } from 'chess.js'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { auth } from '../components/Login/firebase-config'
import { fromRef } from 'rxfire/firestore'
import { db } from '../components/Login/firebase-config'
import { collection, getDocs, where, query, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
let gameRef
let member
export let pgn = '';

const chess = new Chess()
export let updatedData
export let gameSubject
export async function initGame(gameRefFb) {    
    const { currentUser } = auth
    if (gameRefFb) {
        gameRef = gameRefFb
        const docRef = collection(db, 'games');
        const gameQuery = query(docRef, where('game.gameId', '==', gameRefFb.id));
        const snapshot = await getDocs(gameQuery);
        let initialGame = {};
        snapshot.forEach(doc => {
            initialGame = doc.data();
        });
        
        if (!initialGame) {
            return 'notfound'
        }
        const creator = initialGame.game.members.find(m => m.creator === true)
        const usersCollectionRef = collection(db, 'backenddata');
        const currentUser = auth.currentUser;        
      const currentUserDocRef = doc(usersCollectionRef, currentUser.uid);
      let currentUserDocSnapshot = await getDoc(currentUserDocRef);   
      const username = currentUserDocSnapshot.data().username;
        if (initialGame.game.status === 'waiting' && creator.uid !== currentUser.uid) {              
            const currUser = {
                uid: currentUser.uid,
                name: username,
                piece: creator.piece === 'w' ? 'b' : 'w'
            }
 const updatedMembers = [...initialGame.game.members, currUser]
 const game = {
    status: 'ready',
    members: updatedMembers,
    gameId: gameRefFb.id
}
 await updateDoc(doc(db, "games", game.gameId), {
    game:game
})


        } else if (!initialGame.game.members.map(m => m.uid).includes(currentUser.uid)) {
            return 'intruder'
        }
        chess.reset()
        gameSubject = fromRef(gameRefFb).pipe(
            map(gameDoc => {
                const game = gameDoc.data()
                const { pendingPromotion, gameData, ...restOfGame } = game
                member = game.game.members.find(m => m.uid === currentUser.uid)
                const oponent = game.game.members.find(m => m.uid !== currentUser.uid)
                if (gameData) {
                    chess.load(gameData)
                }
                const isGameOver = chess.isGameOver()
                const gameInfo = {
                    board: chess.board(),
                    pendingPromotion,
                    isGameOver,
                    position: member.piece,
                    member,
                    oponent,
                    result: isGameOver ? getGameResult() : null,
                    ...restOfGame
                };
                        return gameInfo;
            })
        )
    
    } else {
        gameRef = null
        gameSubject = new BehaviorSubject()
        const savedGame = localStorage.getItem('savedGame')
        if (savedGame) {
            chess.load(savedGame)
        }
        updateGame()
    }

}

export async function resetGame() {
    if (gameRef) {
        await updateGame(null, true)
        chess.reset()
    } else {
        chess.reset()
        updateGame()
    }

}

export function handleMove(from, to) {

    const promotions = chess.moves({ verbose: true }).filter(m => m.promotion)
    console.table(promotions)
    let pendingPromotion
    if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        pendingPromotion = { from, to, color: promotions[0].color }
        updateGame(pendingPromotion)
    }

    if (!pendingPromotion) {
        move(from, to)
    }
}


export function move(from, to, promotion) {
    let tempMove = { from, to }
    if (promotion) {
        tempMove.promotion = promotion
    }
    console.log({ tempMove, member }, chess.turn())
    if (gameRef) {
        if (member.piece === chess.turn()) {
            const legalMove = chess.move(tempMove)
            
            if (legalMove) {
                pgn+=legalMove
                updateGame()

            }
        }
    } else {
        const legalMove = chess.move(tempMove)

        if (legalMove) {
            updateGame()
        }
    }

}

async function updateGame(pendingPromotion, reset) {
    const isGameOver = chess.isGameOver()

    if (gameRef) {    
        const docRef = collection(db, 'games');
        const gameQuery = query(docRef, where('game.gameId', '==', gameRef.id));
        const querySnapshot = await getDocs(gameQuery);
        const existingData = querySnapshot.docs[0].data();
        
         updatedData = { gameData: chess.fen(), pendingPromotion: pendingPromotion || null,pgn: [...(existingData.pgn || []), ...chess.history()] }
        
         console.log(chess.fen())
        if (reset) {
            updatedData.status = 'over'
        }
        await updateDoc(doc(db, 'games', gameRef.id), updatedData);
    } else {
        const newGame = {
            board: chess.board(),
            pendingPromotion,
            isGameOver,
            position: chess.turn(),
            result: isGameOver ? getGameResult() : null
        }
        localStorage.setItem('savedGame', chess.fen())
        gameSubject.next(newGame)
    }


}
async function getGameResult() {
    if(gameRef){
         const docRef = collection(db, 'games');
        const gameQuery = query(docRef, where('game.gameId', '==', gameRef.id));
        const querySnapshot =await getDocs(gameQuery);
        const existingData = querySnapshot.docs[0].data();
        let moves=existingData.pgn
        console.log(moves)
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
pgn=formattedPGN
console.log(formattedPGN);
    }
   
    if (chess.isCheckmate()) {
        const winner = chess.turn() === "w" ? 'BLACK' : 'WHITE'
        return `CHECKMATE - WINNER - ${winner}`
    } else if (chess.in_draw()) {
        let reason = '50 - MOVES - RULE'
        if (chess.isStalemate()) {
            reason = 'STALEMATE'
        } else if (chess.isThreefoldRepetition()) {
            reason = 'REPETITION'
        } else if (chess.isInsufficientMaterial()) {
            reason = "INSUFFICIENT MATERIAL"
        }
        return `DRAW - ${reason}`
    } else {
        return 'UNKNOWN REASON'
    }
}