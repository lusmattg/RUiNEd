import { ReactElement, useEffect, useState } from "react"
import "./App.css"
import { GameState} from "./logic.ts"

function App() {
  const [game, setGame] = useState<GameState>()
  const [players, setPlayers] = useState<any>();
  const [yourPlayerId, setYourPlayerId] = useState<string>();

  
  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, players, yourPlayerId }) => {
        setGame(newGame);
        setPlayers(players);
        setYourPlayerId(yourPlayerId);
        console.log(players)
      },
    })
  }, [])

  if (!game) {
    return <div>Loading...</div>
  }

  if (!yourPlayerId) {
    return <div>Loading...</div>
  }

  const playerList: Array<ReactElement> = [];
  for (const i of Object.keys(players)) {
    playerList.push(
      <div>
        <img src={players[i].avatarUrl} height='20em' />
        <div>{game.party[i] ? game.party[i].curHp : 0}</div>
      </div>
    )
  }

  const hpBars = <div style={{display: 'grid', gridTemplateColumns: '25% 25% 25% 25%'}}>
    {playerList}
  </div>

  const timer = <div>
    <div className={'timer'}>{game.choiceTimer}</div>
  </div>

  const roomDisplay = <div>
    <div>{game.currentRoom.name}</div>
    <div>{game.currentRoom.desc}</div>    
  </div>

  const nextRoomChoices: Array<ReactElement> = [];
  Object.keys(game.currentRoom.paths).forEach( (nextRoomId) => {
    const n = parseInt(nextRoomId);
    const nextRoomName: string = game.currentRoom.paths[n];
    if (yourPlayerId != undefined) {
      nextRoomChoices.push(
        <button onClick={() => Rune.actions.votePath({pathName: nextRoomName, playerId: yourPlayerId})}>
          {game.currentRoom.paths[n]}
        </button>
      )
    }
  });

  const wornEquipment: Array<ReactElement> = [];
  const helm = yourPlayerId? game?.party?.[yourPlayerId]?.equip?.['helm'] : '';
  const armor = yourPlayerId? game?.party?.[yourPlayerId]?.equip?.['armor'] : '';
  const weapon = yourPlayerId? game?.party?.[yourPlayerId]?.equip?.['weapon'] : '';
  const accessory = yourPlayerId? game?.party?.[yourPlayerId]?.equip?.['accessory'] : '';
  const artifact = yourPlayerId? game?.party?.[yourPlayerId]?.equip?.['artifact'] : '';
  wornEquipment.push(<div>{helm}</div>)
  wornEquipment.push(<div>{armor}</div>)
  wornEquipment.push(<div>{weapon}</div>)
  wornEquipment.push(<div>{accessory}</div>)
  wornEquipment.push(<div>{artifact}</div>)
  const equipDisplay = <div >
    <div style={{display: 'grid', gridTemplateColumns: '20% 20% 20% 20% 20%'}}>{wornEquipment}</div>
  </div>

  if (game.choiceState == 'inAction') {
    if (game.currentRoom.sType == 'rune') {
      //
      return(
      <div>
          {timer}
          {hpBars}
          {equipDisplay}
          {roomDisplay}
          <button onClick={() => Rune.actions.ackRune({playerId: yourPlayerId, game: game})}>Gain Power</button>
      </div>);
    }
    else if (game.currentRoom.sType == 'restoration') {
      //
      return(
      <div>
          {timer}
          {hpBars}
          {equipDisplay}
          {roomDisplay}
          <button onClick={() => Rune.actions.ackRestoration({playerId: yourPlayerId, game: game})}>Great!</button>
      </div>);
    }
    else if (game.currentRoom.sType == 'battle') {
      //
      return(
      <div>
          {timer}
          {hpBars}
          {equipDisplay}
          {roomDisplay}
          <button onClick={() => Rune.actions.winBattle({playerId: yourPlayerId, game: game})}>Cheat</button>
      </div>);
    }
    else if (game.currentRoom.sType == 'treasure') {
      //
      const treasureChoices: Array<ReactElement> = [];
      for (const i of game.currentRoom.sTreasure) {
        treasureChoices.push(
          <button onClick={() => Rune.actions.chooseTreasure({game: game, treasureName: i.name, playerId: yourPlayerId})}>
            {i.name}
          </button>
        )
      }

      if (!game.currentRoom.choseItem[yourPlayerId])
        return(
        <div>
          {timer}
          {hpBars}
          {equipDisplay}
          {roomDisplay}
          {treasureChoices}
          <div>Note: Equipment may replace items in current slots</div>
        </div>);
      else 
        return(
          <div>
            {timer}
            {hpBars}
            {equipDisplay}
            {roomDisplay}
          </div>
        );
    }
    else if (game.currentRoom.sType == 'plain') {
      //
      return(
        <div>
            {timer}
            {hpBars}
            {equipDisplay}
            {roomDisplay}
            <button onClick={() => Rune.actions.ackPlain({playerId: yourPlayerId, game: game})}>Ok!</button>
        </div>);
  
    }
    else if (game.currentRoom.sType == 'win') {
      //
      return(
        <div>
            {timer}
            {hpBars}
            {equipDisplay}
            {roomDisplay}
        </div>);
  
    }
    return (
      <div>
        <div>
          Yikes
        </div>
        <div>    
        </div>
      </div>
    )
  }


  if (game.choiceState == 'inVoteNext') {
    return (
      <div>
        <div>
        </div>
        <div>
          {timer}
          {hpBars}
          {equipDisplay}
          {roomDisplay}
          <div>Vote for which room to go to next</div>
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
