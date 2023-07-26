import React, { ReactElement, useEffect, useState } from "react"
import reactLogo from "./assets/rune.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { GameState, Room } from "./logic.ts"

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
      },
    })
  }, [])

  if (!game) {
    return <div>Loading...</div>
  }

  const playerList: Array<ReactElement> = [];
  for (const i of Object.keys(players)) {
    playerList.push(
      <div>
        <img src={players[i].avatarUrl} width='80%' />
        <div>{game.party[i] ? game.party[i].curHp : 0}</div>
      </div>
    )
  }

  const hpBars = <div style={{display: 'grid', gridTemplateColumns: '25% 25% 25% 25%'}}>
    {playerList}
  </div>

  const timer = <div>
    <div>{game.choiceTimer}</div>
  </div>

  const roomDisplay = <div>
    <div>{game.currentRoom.name}</div>
    <div>{game.currentRoom.desc}</div>    
  </div>

  const nextRoomChoices: Array<ReactElement> = [];
  Object.keys(game.currentRoom.paths).forEach( (nextRoomId: string) => {
    nextRoomChoices.push(
      <button onClick={() => Rune.actions.votePath({pathName: nextRoomId, playerId: yourPlayerId})}>
        {game.currentRoom.paths[nextRoomId]}
      </button>
    )
  });

  const wornEquipment: Array<ReactElement> = [];
  const helm = game.party[yourPlayerId].equip['helm'];
  const armor = game.party[yourPlayerId].equip['armor'];
  const weapon = game.party[yourPlayerId].equip['weapon'];
  const accessory = game.party[yourPlayerId].equip['accessory'];
  const artifact = game.party[yourPlayerId].equip['artifact'];
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
          <button onClick={() => Rune.actions.ackRune({game: game})}>Great!</button>
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
          <button onClick={() => Rune.actions.ackRestoration({game: game})}>Great!</button>
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
          <button onClick={() => Rune.actions.winBattle({game: game})}>Cheat</button>
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
            <button onClick={() => Rune.actions.ackPlain({game: game})}>Ok!</button>
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
          <button onClick={() => Rune.actions.skipToNextRoom({game: game})}>
            vote
        </button>
    
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
