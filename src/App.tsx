import { ReactElement, useEffect, useState, useRef } from "react"
import "./App.css"
import { GameState, powers, runes} from "./logic.ts"
import greenCheck from './assets/greencheck.svg'
import trEmsword from './assets/tr-emsword.png'
import trMyth from './assets/tr-myth.png'
import trRainb from './assets/tr-rainb.png'
import trRubys from './assets/tr-rubys.png'
import trPinata from './assets/tr-pinata.png'
import trPHelm from './assets/tr-partyhelm.png'
import trCSaber from './assets/tr-csaber.png'
import trBLight from './assets/tr-ballightnings.png'
import trNone from './assets/tr-none.png'

import rMightRune from './assets/runeatk.png'
import rShieldRune from './assets/runephysdef.png'
import rHealthRune from './assets/runehp.png'
import rSpeedRune from './assets/runespeed.png'

function App() {
  const [game, setGame] = useState<GameState>()
  const [players, setPlayers] = useState<any>();
  const [yourPlayerId, setYourPlayerId] = useState<string>();

  const battleLogText = useRef();
  
  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, players, yourPlayerId }) => {
        setGame(newGame);
        setPlayers(players);
        setYourPlayerId(yourPlayerId);
      },
    })
    battleLogText.scrollTop = battleLogText.scrollHeight;
  }, [])

  if (!game) {
    return <div>Loading...</div>
  }

  const getTreasureImage = (treasureName: string) : string => {
    switch (treasureName) {
      case 'Rainbow Robe':
        return trRainb;
      case 'Mythril Mail':
        return trMyth;
      case 'Pinata Armor':
        return trPinata;
      case 'Emerald Sword':
        return trEmsword;
      case 'Ruby Staff':
        return trRubys;
      case 'Champagne Saber':
        return trCSaber;
      case 'Party Helm':
        return trPHelm;
      case 'Balloon Lightning':
        return trBLight;
    }
    return trNone;
  }

  const getRuneImage = (runeName: string) : string => {
    switch (runeName) {
      case 'Might Rune':
        return rMightRune;
      case 'Speed Rune':
        return rSpeedRune;
      case 'Shield Rune':
        return rShieldRune;
      case 'Health Rune':
        return rHealthRune;
    }
    return greenCheck;
  }

  const playerList: Array<ReactElement> = [];
  for (const i of Object.keys(players)) {



    const wornEquipment: Array<ReactElement> = [];
    const helm = game?.party?.[i]?.equip?.['helm'];
    const armor = game?.party?.[i]?.equip?.['armor'];
    const weapon = game?.party?.[i]?.equip?.['weapon'];
    const accessory = game?.party?.[i]?.equip?.['accessory'];

    wornEquipment.push(<div><img src={getTreasureImage(helm)} width='100%'/></div>)
    wornEquipment.push(<div><img src={getTreasureImage(armor)} width='100%'/></div>)
    wornEquipment.push(<div><img src={getTreasureImage(weapon)} width='100%'/></div>)
    wornEquipment.push(<div><img src={getTreasureImage(accessory)} width='100%'/></div>)

    const equipDisplay = <div >
      <div style={{display: 'grid', gridTemplateColumns: '25% 25% 25% 25%'}}>{wornEquipment}</div>
    </div>


    const checkDisp = ((game.currentRoom.choseItem[i] && game.choiceState == 'inAction' ) || (game.currentRoom.pathVotes[i] && game.choiceState == 'inVoteNext') )  ? 'block' : 'none';
    const hpP = game.party[i].curHp / game.party[i].maxHp * 100 + '%';
    playerList.push(
      <div className={'playerBox'}>
        <div className={'playerName'}>{players[i].displayName}</div>
        <div >
          <div style={{height: '2em'}}>
            <img src={players[i].avatarUrl} height={'100%'} />
            <div style={{display: checkDisp, position: 'relative'}}>
              <img className={'greenCheck'} src={greenCheck} height='20em' style={{ position: 'absolute', bottom: 0, left: 0}}/>
            </div>
          </div>
        </div>
        <div className={'lifebarred'}>
          <div className={'lifebargreen'} style={{width: hpP }}></div>
        </div>
        {equipDisplay}
      </div>
    )
  }

  const hpBars = <div style={{display: 'grid', gridTemplateColumns: '25% 25% 25% 25%'}}>
    {playerList}
  </div>

  const timer = <div>
    <div className={'timer'}>{game.choiceTimer}</div>
  </div>

  const roomDisplay = <div className={'roomBox'}>
    <div style={{textAlign: 'center', fontStyle: 'bold'}}>{game.currentRoom.name}</div>
    <div style={{fontSize: 'small'}}>{game.currentRoom.desc}</div>    
  </div>

  const nextRoomChoices: Array<ReactElement> = [];
  Object.keys(game.currentRoom.paths).forEach( (nextRoomId) => {
    const n = parseInt(nextRoomId);
    const nextRoomName: string = game.currentRoom.paths[n];
    const nextRoomIntro: string = game.currentRoom.pathIntros[n];
    if (yourPlayerId != undefined) {
      nextRoomChoices.push(
        <button className={'pathButton'} onClick={() => Rune.actions.votePath({pathName: nextRoomName, playerId: yourPlayerId})}>
          {nextRoomIntro}
        </button>
      )
    }
  });



  if (game.choiceState == 'inAction') {
    if (game.currentRoom.sType == 'rune') {
      const runeChoices: Array<ReactElement> = [];
      for (const i of game.currentRoom.sRune) {
        const mods = [];
        const rune = runes[i];
        for (const e of rune) {
          mods.push(<div>{e.affectedStat} x{e.magnitude}</div>)
        }
        runeChoices.push(
          <div className={'runeCard'} onClick={() => Rune.actions.chooseRune({game: game, rune: i, playerId: yourPlayerId ? yourPlayerId : ''})}>
            <div>
              <div>
                {i}
              </div>
              <div className={'runeMods'}>
                {mods}
              </div>
            </div>
            <div style={{maxHeight: '2em'}}>
              <img style={{height: '2em', position: 'absolute', right: '1em'}} src={getRuneImage(i)} height='100%'/>
            </div>
          </div>
        )
      }

      if (yourPlayerId && !game.currentRoom.choseItem[yourPlayerId])
        return(
        <div>
          {timer}
          {hpBars}
          {roomDisplay}
          {runeChoices}
        </div>);
      else 
        return(
          <div>
            {timer}
            {hpBars}
            {roomDisplay}
            {runeChoices}
          </div>
        );

    }
    else if (game.currentRoom.sType == 'restoration') {
      //
      return(
      <div>
          {timer}
          {hpBars}
          {roomDisplay}
          <button className={'fountainButton'} onClick={() => Rune.actions.ackRestoration({playerId: yourPlayerId ? yourPlayerId : '', accepted: true, game: game})}>Drink</button>
          <button className={'fountainButton'} onClick={() => Rune.actions.ackRestoration({playerId: yourPlayerId ? yourPlayerId : '', accepted: false, game: game})}>Don't Drink</button>
      </div>);
    }
    else if (game.currentRoom.sType == 'battle') {
      //
      const validGlobalMoves: Array<ReactElement> = [];
      if (yourPlayerId) {
        for (const p of game.party[yourPlayerId].powers  ) {
          const pow = powers[p];
          const scope = pow[0].scope;
          if (scope == 'self' || scope == 'party' || scope == 'enemyParty' || scope == 'all') { 
            validGlobalMoves.push(
              <button className='battleButton'
                onClick={() => Rune.actions.attack({
                  playerId: yourPlayerId,
                  enemyName: 'na',
                  attack: p,
                  game: game
                })}
                >{p}</button>
            )
          }
        }
      }
      const allyList: Array<ReactElement> = [];
      for (const p of Object.keys(game.party)) {
        const ally = game.party[p];
        const allyCard = <div>
          <div>{players[p].displayName}</div>
          <div>{game.battle.initiative[p]}</div>
        </div>
        allyList.push(allyCard);
      }

      const enemyList: Array<ReactElement> = [];
      for (const e of game.battle.enemies) {
        //
        // valid attacks
        const validAttacks: Array<ReactElement> = [];
        if (yourPlayerId) {
          if (e.curHp > 0) {
            for (const p of game.party[yourPlayerId].powers  ) {
              const pow = powers[p];
              const scope = pow[0].scope;
              if (scope == 'anyOne' || scope == 'enemy') {
                validAttacks.push(
                  <button className='battleButton'
                    onClick={() => Rune.actions.attack({
                      playerId: yourPlayerId ? yourPlayerId: '',
                      enemyName: e.name,
                      attack: p,
                      game: game
                    })}
                    >{p}</button>
                )
              }
            }
          }
        }
        // enemy card
        const eHpP = e.curHp / e.maxHp * 100 + '%';
        let styleOverride = {};
        if (e.curHp <= 0) styleOverride = {backgroundColor: 'gray'};
        const enemyCard = <div style={styleOverride} className={'enemyCard'} >
          <div>{e.name}</div>
          <div>
            <div className={'lifebarred'}>
              <div className={'lifebargreen'} style={{width: eHpP }}></div>
            </div>
          </div>
          <div>{validAttacks}</div>
        </div>
        enemyList.push(enemyCard)
      }

      return(
      <div>
          {timer}
          {hpBars}
          {roomDisplay}
          {validGlobalMoves}
          <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>{allyList}</div>
          <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>{enemyList}</div>
          <textarea ref={battleLogText} value={game.battle.log} readOnly={true} style={{width: '100%', height: '10em'}}></textarea>
      </div>);
    }
    else if (game.currentRoom.sType == 'treasure') {
      //
      const treasureChoices: Array<ReactElement> = [];
      for (const i of game.currentRoom.sTreasure) {
        const mods = [];
        for (const e of i.effects) {
          mods.push(<div>{e.affectedStat} x{e.magnitude}</div>)
        }
        treasureChoices.push(
          <div className={'treasureCard'} onClick={() => Rune.actions.chooseTreasure({game: game, treasureName: i.name, playerId: yourPlayerId ? yourPlayerId : ''})}>
            <div>
              <div>
                {i.name}
              </div>
              <div className={'treasureMods'}>
                {mods}
              </div>
            </div>
            <div style={{maxHeight: '2em'}}>
              <img style={{height: '2em', position: 'absolute', right: '1em'}} src={getTreasureImage(i.name)} height='100%'/>
            </div>
          </div>
        )
      }

      if (yourPlayerId && !game.currentRoom.choseItem[yourPlayerId])
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
    else if (game.currentRoom.sType == 'teacher') {
      //

      const powerChoices: Array<ReactElement> = [];
      if (yourPlayerId) {
        for (const i of game.currentRoom.sPowers) {
          const pow = powers[i];
          powerChoices.push(
            <div className={'powerCard'} onClick={() => {Rune.actions.choosePower({playerId: yourPlayerId, power: i, game: game})}}>
              <div>{i}</div>
              <div className={'powerMods'}></div>
            </div>
          )
        }
      }
      return(
        <div>
            {timer}
            {hpBars}
            {roomDisplay}
            {powerChoices}
            <button onClick={() => Rune.actions.ackPlain({playerId: yourPlayerId? yourPlayerId : '', game: game})}>Ok!</button>
        </div>);
  
    }
    else if (game.currentRoom.sType == 'plain') {
      //
      return(
        <div>
            {timer}
            {hpBars}
            {roomDisplay}
            <button className={'fountainButton'} onClick={() => Rune.actions.ackPlain({playerId: yourPlayerId? yourPlayerId:'', game: game})}>Ok!</button>
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
          <div>Vote where to go next!</div>
          <div className={'pathChoices'}>
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
