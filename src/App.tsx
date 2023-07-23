import { ReactElement, useEffect, useState } from "react"
import reactLogo from "./assets/rune.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { GameState, Room } from "./logic.ts"

function App() {
  const [game, setGame] = useState<GameState>()
  const [players, setPlayers] = useState<any>();
  const [yourPlayerId, setYourPlayerId] = useState<string>();

  console.log('Game:', game);
  console.log('Your Player Id:', yourPlayerId);
  console.log('Players:', players);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, players, yourPlayerId }) => {
        setGame(newGame);
        setPlayers(players);
        setYourPlayerId(yourPlayerId);
      },
    })
  }, [])

  if (!game) {
    return <div>Loading...</div>
  }

  const playerList: Array<ReactElement> = [];
  Object.keys(game.party).forEach( (pk) => {
    playerList.push(
      <div>
        <div>test</div>
        <div>Pk: {pk}</div>
        
      </div>
    )
  })

  if (game.choiceState == 'inAction') {
    return (
      <div>
        <div>
        </div>
        <div>
          <div>{game.currentRoom.name}</div>
          <div>{game.currentRoom.desc}</div>    
          <div>{game.choiceTimer}</div>
          <button onClick={() => Rune.actions.skipToNextRoom({game: game})}>
            vote
        </button>
    
        </div>
      </div>
    )
  }

  const nextRoomChoices: Array<ReactElement> = [];
  Object.keys(game.currentRoom.paths).forEach( (nextRoomId: string) => {
    nextRoomChoices.push(
      <button onClick={() => Rune.actions.changeRoom({game: game, newRoom: game.currentRoom.paths[nextRoomId]})}>
        {game.currentRoom.paths[nextRoomId]}
      </button>
    )
  });
  if (game.choiceState == 'inVoteNext') {
    return (
      <div>
        <div>
        </div>
        <div>
          <div>{game.currentRoom.name}</div>
          <div>{game.currentRoom.desc}</div>  
          <div>
            {nextRoomChoices}
          </div>      
        </div>
      </div>
    )    
  }

  return (
    <>
      <div className="card">
        <button onClick={() => Rune.actions.increment({ amount: 1 })}>
          count is {game.count}
        </button>
      </div>
      <div>
        
      </div>
      {playerList}
    </>
  )
}

export default App
