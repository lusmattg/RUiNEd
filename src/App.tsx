import { ReactElement, useEffect, useState } from "react"
import reactLogo from "./assets/rune.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { GameState } from "./logic.ts"

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

  return (
    <>
      <h1>Vite + Rune</h1>
      <div className="card">
        <button onClick={() => Rune.actions.increment({ amount: 1 })}>
          count is {game.count}
        </button>
      </div>
      {playerList}
    </>
  )
}

export default App
