import { ReactElement, useEffect, useState } from "react"
import "./App.css"
import { GameState} from "./logic.ts"
import greenCheck from './assets/greencheck.svg'
import trEmsword from './assets/tr-emsword.png'
import trMyth from './assets/tr-myth.png'
import trRainb from './assets/tr-rainb.png'
import trRubys from './assets/tr-rubys.png'

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



    const wornEquipment: Array<ReactElement> = [];
    const helm = game?.party?.[i]?.equip?.['helm'];
    const armor = game?.party?.[i]?.equip?.['armor'];
    const weapon = game?.party?.[i]?.equip?.['weapon'];
    const accessory = game?.party?.[i]?.equip?.['accessory'];
    switch (helm) {
      case 'Party Helm':
        wornEquipment.push(<div>{'test'}</div>)
    }
    switch (armor) {
      case 'Rainbow Robe':
        wornEquipment.push(<div><img src={trRainb} width='100%'/></div>);
        break;
      case 'Mythril Mail':
        wornEquipment.push(<div><img src={trMyth} width='100%'/></div>)
        break;
        case 'Pinata Armor':
          wornEquipment.push(<div><img src={trMyth} width='100%'/></div>)
          break;
      }
    switch (weapon) {
      case 'Emerald Sword':
        wornEquipment.push(<div><img src={trEmsword} width='100%'/></div>);
        break;
      case 'Ruby Staff':
        wornEquipment.push(<div><img src={trRubys} width='100%'/></div>)
        break;
      case 'Champagne Saber':
        wornEquipment.push(<div><img src={trRubys} width='100%'/></div>)
        break;
    }
    switch (accessory) {
      case 'Balloon Lightning':
        wornEquipment.push(<div>{'test'}</div>)
    }

    const equipDisplay = <div >
      <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>{wornEquipment}</div>
    </div>


    const checkDisp = game.currentRoom.choseItem[i] ? 'block' : 'none';
    const hpP = game.party[i].curHp / game.party[i].maxHp * 100 + '%';
    playerList.push(
      <div className={'playerBox'}>
        <div className={'playerName'}>{players[i].displayName}</div>
        <div >
          <div style={{height: '2em'}}>
            <img src={players[i].avatarUrl} height={'100%'} />
            <div style={{display: checkDisp}}>
              <img src={greenCheck} height='10em' style={{  position: 'absolute', bottom: 0,  right: 0}}/>
            </div>
          </div>
        </div>
        <div className={'equipGrid'}>
          {equipDisplay}
        </div>
        <div className={'lifebarred'}>
          <div className={'lifebargreen'} style={{width: hpP }}></div>
        </div>
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



  if (game.choiceState == 'inAction') {
    if (game.currentRoom.sType == 'rune') {
      //
      return(
      <div>
          {timer}
          {hpBars}
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
          {roomDisplay}
          {treasureChoices}
          <div>Note: Equipment may replace items in current slots</div>
        </div>);
      else 
        return(
          <div>
            {timer}
            {hpBars}
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
