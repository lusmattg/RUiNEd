import type { RuneClient } from "rune-games-sdk/multiplayer"

export interface GameState {
  count: number,
  currentRoom: Room,
  party: { [key: string]: PartyMember },
  choiceState: string,
  choiceTimer: number,
  battle: Battle,
}

export type GameActions = {
  increment: (params: { amount: number }) => void
  changeRoom: (params: { newRoom: string }) => void
  chooseTreasure: (params: { treasureName: string, playerId: string, game: GameState }) => void
  votePath: (params: {pathName: string, playerId: string}) => void;
  ackRestoration: (params: {playerId: string, accepted: boolean, game: GameState}) => void;
  winBattle: (params: {playerId: string, game: GameState}) => void;
  ackPlain: (params: {playerId: string, game: GameState}) => void;
  choosePower: (params: {power: string, playerId: string, game: GameState}) => void;
  chooseRune: (params: {rune: string, playerId: string, game: GameState}) => void;
  attack: (params: {playerId: string, enemyName: string, attack: string, game: GameState}) => void;
}

export type Battle = {
  enemies: Array<Enemy>,
  log: string,
}

export type Party = {
  [key: string]: PartyMember,
}

export type Equipment = {
  helm: string,
  armor: string,
  weapon: string,
  accessory: string,
  artifact: string,
}

export type PartyMember = {
  maxHp: number,
  curHp: number,
  physAtk: number,
  magAtk: number,
  physDef: number,
  magDef: number,
  equip: Equipment,
  powers: Array<string>,
  runes: Array<string>,
}

export type Enemy = {
  name: string,
  maxHp: number,
  curHp: number,
  physAtk: number,
  magAtk: number,
  physDef: number,
  magDef: number,
  attacks: Record<string,Array<Effect>>,
}

export type Treasure = {
  name: string,
  slot: keyof Equipment,
  effects: Array<Effect>
}

export type Power = {
  name: string,  
  effects: Array<Effect>
}

export type RoomRune = {
  name: string,
  effects: Array<Effect>
}

export type Room = {
  name: string,
  desc: string,
  sType: string,
  sEnemies: Array<string>,
  sTreasure: Array<Treasure>,
  sLocked: boolean,
  sRune: Array<string>,
  sPowers: Array<string>,
  paths: Array<string>,
  pathIntros: Array<string>,
  choseItem: { [key: string]: boolean },
  pathVotes: { [key: string]: string },
  choseUpgrade: { [key: string]: boolean },
}

export type Effect = {
  name: string,
  duration: number,
  magnitude: number,
  scope: string, // anyOne, self, player, party, enemy, enemyParty, all
  affectedStat: string // physAtk, magAtk, physDef, magDef, maxHp, curHp
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export function getCount(game: GameState) {
  return game.count;
}

const wholePartyChoseItem = (game: GameState) => {
  for (const i of Object.keys(game.party)) {
    if (!game.currentRoom.choseItem[i]) {
      return false;
    }
  }
  return true;
}

const wholePartyVoted = (game: GameState) => {
  for (const i of Object.keys(game.party)) {
    if (!game.currentRoom.pathVotes[i]) {
      return false;
    }
  }
  return true;
}

const pathVoteResult = (game: GameState) => {
  const candidates: Record<string, number> = {};
  let winner = '';
  let winnerVotes = 0;
  for (const i of Object.keys(game.currentRoom.pathVotes)) {
    const vote = game.currentRoom.pathVotes[i];
    if (candidates[vote]) {
      candidates[vote] += 1;
      if (candidates[vote] > winnerVotes) {
        winner = vote;
        winnerVotes = candidates[vote];
      }
    }
    else {
      candidates[vote] = 1;
      if (candidates[vote] > winnerVotes) {
        winner = vote;
        winnerVotes = candidates[vote];
      }
    }
  }
  return winner;
}

const doNothingWith = (s: string) => {
  console.log(s);
}


const treasure: Record<string, Treasure> = {
  'Emerald Sword': {
    name: 'Emerald Sword',
    slot: 'weapon',
    effects: [
      { name: 'weaponStrBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'physAtk'  }
    ]
  },
  'Ruby Staff': {
    name: 'Ruby Staff',
    slot: 'weapon',
    effects: [
      { name: 'weaponMagBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'magAtk'}
    ]
  },
  'Mythril Mail': {
    name: 'Mythril Mail',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'physDef'}
    ]
  },
  'Rainbow Robe': {
    name: 'Rainbow Robe',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'magDef'}
    ]
  }
}

export const powers: Record<string, Array<Effect>> = {
  'Heal':[{name: 'Heal', duration: -1, magnitude: 2, scope: 'ally', affectedStat: 'curHp'}],
  'Death Darts':[{name: 'Death Darts', duration: -1, magnitude: 1.5, scope: 'enemyParty', affectedStat: 'curHp'}],
  'Protect All':[{name: 'Protect All', duration: 5000, magnitude: 1.1, scope: 'party', affectedStat: 'physDef'}],
  'Rally':[{name: 'Rally', duration: 5000, magnitude: 1.1, scope: 'party', affectedStat: 'physAtk'}],
  'Punch': [{name: 'Punch', duration: -1, magnitude: 0.8, scope: 'enemy', affectedStat: 'curHp'}],
}

export const runes: Record<string, Array<Effect>> = {
  'Might Rune': [{name: 'Might Rune', duration: -1, magnitude: 5, scope: 'self', affectedStat: 'physAtk'}],
  'Power Rune': [{name: 'Power Rune', duration: -1, magnitude: 5, scope: 'self', affectedStat: 'magAtk'}],
  'Shield Rune': [{name: 'Shield Rune', duration: -1, magnitude: 5, scope: 'self', affectedStat: 'physDef'}],
  'Barrier Rune': [{name: 'Barrier Rune', duration: -1, magnitude: 5, scope: 'self', affectedStat: 'magDef'}],
}

const enemies: Record<string, Enemy> = {
  'eWhiteGem': {
    name: 'White Gem',
    maxHp: 10,
    curHp: 10,
    physAtk: 5,
    magAtk: 5,
    physDef: 5,
    magDef: 5,
    attacks: {
      'Barrier': [
        { name: 'White Gem Phys Barrier', duration: 1000, magnitude: 50, scope: 'enemyParty', affectedStat: 'physDef' },
        { name: 'White Gem Mag Barrier', duration: 1000, magnitude: 50, scope: 'enemyParty', affectedStat: 'magDef' }
      ]
    }
  },
  'eGemKeeper': {
    name: 'Gem Keeper',
    maxHp: 10,
    curHp: 10,
    physAtk: 5,
    magAtk: 5,
    physDef: 5,
    magDef: 5,
    attacks: {
      'Chisel': [
        { name: 'Gem Keeper Phys Debuff', duration: -1, magnitude: -5, scope: 'player', affectedStat: 'curHp' },
      ]
    }
  },
  'eGreenGem': {
    name: 'Green Gem',
    maxHp: 10,
    curHp: 10,
    physAtk: 5,
    magAtk: 5,
    physDef: 5,
    magDef: 5,
    attacks: {
      'Heal': [
        { name: 'Green Gem Heal', duration: -1, magnitude: 50, scope: 'enemyParty', affectedStat: 'curHp' },
      ]
    }
  },
}

doNothingWith(JSON.stringify(enemies)); //TODO: remove

const rooms: Record<string, Room> = {
  'rTutorialRuneRoom': {
    name: 'Tutorial - Runes',
    desc: 'In RUiNEd, you\'ll encounter runes! This one makes you stronger!',
    sType: 'rune',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: ['Might Rune','Power Rune','Shield Rune','Barrier Rune'],
    sPowers: [],
    paths: ['rTutorialTeacherRoom'],
    pathIntros: ['A teacher ahead'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rTutorialRestorationRoom':{
    name: 'Tutorial - Restoration',
    desc: 'In RUiNEd, you\'ll encounter fountains! They restore your health.',
    sType: 'restoration',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: ['rTutorialChoiceRoom'],
    pathIntros: ['The path forks ahead'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rTutorialEnemyRoom':{
    name: 'Tutorial - Enemies',
    desc: 'In RUiNEd, you\'ll encounter monsters! In this fight, try taking out the White Gem first!',
    sType: 'battle',
    sEnemies: ['eWhiteGem','eGemKeeper','eGreenGem'],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: ['rTutorialRestorationRoom'],
    pathIntros: ['The sound of water ahead'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {}, 
  },
  'rTutorialTreasureRoom':{
    name: 'Tutorial - Treasure',
    desc: 'In RUiNEd, you\'ll find treasure! Choose one now!',
    sType: 'treasure',
    sEnemies: [],
    sTreasure: [treasure['Emerald Sword'],treasure['Ruby Staff'],treasure['Mythril Mail'],treasure['Rainbow Robe']],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: ['rTutorialRuneRoom'],
    pathIntros: ['Mysterious etchings ahead'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rTutorialChoiceRoom':{
    name: 'Tutorial - Choice',
    desc: 'In RUiNEd, you\'ll sometimes have to choose which room to visit next!',
    sType: 'plain',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: ['rWinRoom','rTutorialChoiceRoom'],
    pathIntros: ['A light ahead?','The path forks ahead'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rTutorialTeacherRoom':{
    name: 'Tutorial - Teachers',
    desc: 'In RUiNEd, you\'ll sometimes encounter teachers! They\'ll teach you new powers.',
    sType: 'teacher',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: ['Heal', 'Death Darts','Protect All','Rally'],
    paths: ['rTutorialEnemyRoom'],
    pathIntros: ['Is that danger ahead?'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rWinRoom':{
    name: 'Congrats!',
    desc: 'A light at the end of the ruins! You win!',
    sType: 'win',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: [],
    pathIntros: [],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  }
}

const changeRoom = (newRoom: string, game: GameState) => {
  console.log(game)
  console.log('CHANGING ROOM TO ', newRoom);
  game.currentRoom = rooms[newRoom];
  game.choiceState = 'inAction';
  game.choiceTimer = 30;
  if (game.currentRoom.sType == 'battle') {
    game.battle.enemies = [];
    for (const e of game.currentRoom.sEnemies) {
      const enemy: Enemy = {
        name: enemies[e].name,
        maxHp: enemies[e].maxHp,
        curHp: enemies[e].maxHp,
        physAtk: enemies[e].physAtk,
        magAtk: enemies[e].magAtk,
        physDef: enemies[e].physDef,
        magDef: enemies[e].magDef,
        attacks: enemies[e].attacks
      };
      game.battle.enemies.push(enemy);
    }
  }
  else {
    game.battle.enemies = [];
  }
}

const getBattleEnemyId = (enemyName: string, game: GameState) => {
  for (const i in game.battle.enemies) {
    if (game.battle.enemies[i].name == enemyName) return parseInt(i);
  }
  return -1;
}

const getBuffs = (stat: string, playerId: string, game: GameState) => {
  let result = 1;

  return result;
}

const resolveImmediateAttack = (e: Effect, playerId: string, enemyName: string, attackName: string, game: GameState) => {
  doNothingWith(playerId);
  const pl = game.party[playerId];
  const dmg = pl['physAtk'] * getBuffs('physAtk',playerId,game) * e.magnitude;
  
  doNothingWith(attackName);
  if (e.affectedStat == 'curHp') {
    const enemyId: number = getBattleEnemyId(enemyName, game);
    game.battle.enemies[enemyId].curHp -= dmg;
    if (dmg >= 0) {
      const l = '\n' + 'player dealt ' + dmg + ' damage to ' + enemyName;
      game.battle.log += l;
    }
    else {
      const l = '\n' + 'player healed ' + dmg + ' damage to ' + enemyName;
      game.battle.log += l;
    }
  }
  else {
    console.log('Bad effect')
  }
}

const battleIsOver = (game: GameState) => {
  for (const e of game.battle.enemies) {  
    if (e.curHp > 0) return false;
  }
  return true;
}

const tpk = (game: GameState) => {
  for (const i of Object.keys(game.party)) {
    if (game.party[i].curHp > 0) return false;
  }
  return true;
}

const handleAttack = (playerId: string, enemyName: string, attack: string, game: GameState) => {
  const pow = powers[attack];
  console.log('Power is ', pow)
  for (const e of pow) {
    console.log(e)
    if (e.scope == 'self') {
      //
    }
    else if (e.scope == 'player') {
      //
    }
    else if (e.scope == 'enemy') {
      if (e.duration == -1) {
        resolveImmediateAttack(e, playerId, enemyName, attack, game);
      }
    }
    else if (e.scope == 'party') {
      //
    }
    else if (e.scope == 'enemyParty') {
      //
      if (e.duration == -1) {
        for (const en of game.battle.enemies) {
          resolveImmediateAttack(e, playerId, en.name, attack, game);
        }
      }
    }
    else if (e.scope == 'all') {
      //
    }
    else {
      console.log('Bad scope ', e.scope)
    }
  }

}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (allPlayerIds): GameState => {
    const startingParty: Party = {};

    for (const playerId of allPlayerIds) {
      startingParty[playerId] = {
        maxHp: 40,
        curHp: 30,
        physAtk: 10,
        magAtk: 10,
        physDef: 10,
        magDef: 10,
        equip: {helm: '', armor: '', weapon: '', accessory: '', artifact: ''},
        powers: ['Punch'],
        runes: [],
      };

    }
    return { 
      count: 0,
      //currentRoom: rooms['rTutorialTreasureRoom'],
      currentRoom: rooms['rTutorialTeacherRoom'],
      party: startingParty,
      choiceState: 'inAction',
      choiceTimer: 60,
      battle: {enemies: []}
    }
  },
  update: ({game}) => {
    if (game.currentRoom.sType == 'win') {
      const pW: Record<string, 'WON'> = {};
      for (const i of Object.keys(game.party)) {
        pW[i] = 'WON';
      }
      Rune.gameOver({
        players: pW,
        delayPopUp: true,
      })
    }
    else if (game.currentRoom.sType == 'battle') {
      if (battleIsOver(game)) {
        for (const i of Object.keys(game.party)) {
          game.currentRoom.choseItem[i] = true;
        }
      }
      else if (tpk(game)) {
        const pW: Record<string, 'LOST'> = {};
        for (const i of Object.keys(game.party)) {
          pW[i] = 'LOST';
        }
        Rune.gameOver({
          players: pW,
          delayPopUp: true,
        })  
      }
      else {
        game.choiceTimer = 60;
      }
    }

    //if (game.choiceTimer > -1) {
      //game.choiceTimer -= 1;  //TODO: turn back on
      if (game.choiceTimer <= 0) {
        if(game.choiceState == 'inAction') {
          //
          game.choiceState = 'inVoteNext';
          game.choiceTimer = 10;
        }
        else if (game.choiceState == 'inVoteNext') {
          game.choiceState = 'inAction';
          let nextRoom = pathVoteResult(game);
          if (nextRoom == '' || nextRoom == null) nextRoom = game.currentRoom.paths[0];
          changeRoom(nextRoom, game)
        }
      }
      else {
        if (game.choiceState == 'inAction') {
          if (wholePartyChoseItem(game)) {
            game.choiceTimer = 0;
          }    
        }
        else if (game.choiceState == 'inVoteNext') {
          if (wholePartyVoted(game)) {
            let nextRoom = pathVoteResult(game);
            if (nextRoom == '' || nextRoom == null) nextRoom = game.currentRoom.paths[0];
            changeRoom(nextRoom, game)
            }
        }
      }
    //}
  },
  actions: {
    increment: ({ amount }, { game }) => {
      game.count += amount
    },
    changeRoom: ({newRoom},{game}) => {
      changeRoom(newRoom, game);
    },
    chooseTreasure: ({playerId, treasureName},{game}) => {
      if (!game.currentRoom.choseItem[playerId]) {
        const slot = treasure[treasureName].slot;
        game.party[playerId].equip[slot] = treasureName;
        game.currentRoom.choseItem[playerId] = true;
      }
      else throw Rune.invalidAction();
    },
    choosePower: ({playerId, power},{game}) => {
      if (!game.currentRoom.choseItem[playerId]) {
        game.party[playerId].powers.push(power);
        game.currentRoom.choseItem[playerId] = true;
      }
    },
    chooseRune: ({playerId, rune},{game}) => {
      if (!game.currentRoom.choseItem[playerId]) {
        game.party[playerId].runes.push(rune);
        game.currentRoom.choseItem[playerId] = true;
      }
    },
    votePath: ({playerId, pathName},{game}) => {
      game.currentRoom.pathVotes[playerId] = pathName;
    },
    winBattle: ({playerId},{game}) => {
      doNothingWith(playerId);
      for (const e of game.battle.enemies) {  
        e.curHp = 0;
      }
    },
    ackRestoration: ({playerId, accepted},{game}) => {
      if (accepted) game.party[playerId].curHp = game.party[playerId].maxHp;
      game.currentRoom.choseItem[playerId] = true;
    },
    ackPlain: ({playerId},{game}) => {
      doNothingWith(playerId);
      for (const i of Object.keys(game.party)) {
        game.currentRoom.choseItem[i] = true;
      }
    },
    attack: ({playerId, enemyName, attack},{game}) => {
      console.log(playerId + ' attacks ' + enemyName + ' with ' + JSON.stringify(attack));
      handleAttack(playerId, enemyName, attack, game);
    }
  },
  events: {
    playerJoined: (playerId: string, {game}) => {
      console.log('player joined', game)
      game.party[playerId] = {
        maxHp: 40,
        curHp: 40,
        physAtk: 10,
        magAtk: 10,
        physDef: 10,
        magDef: 10,
        equip: {helm: '', armor: 'Mythril Mail', weapon: 'Emerald Sword', accessory: '', artifact: ''},
        powers: ['Punch'],
        runes: [],
      }
    },
    playerLeft(playerId: string, {game}) {
      // Handle player left
      delete game.party[playerId]
    },
  },
})
