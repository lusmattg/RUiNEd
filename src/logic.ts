import type { RuneClient } from "rune-games-sdk/multiplayer"

export interface GameState {
  count: number,
  currentRoom: Room,
  party: { [key: string]: PartyMember },
  choiceState: string,
  choiceTimer: number,
}

type GameActions = {
  increment: (params: { amount: number }) => void
}

export type Party = {
  [key: string]: PartyMember,
}

export type PartyMember = {
  maxHp: number,
  curHp: number,
  physAtk: number,
  magAtk: number,
  physDef: number,
  magDef: number,
}

export type Enemy = {
  maxHp: number,
  curHp: number,
  physAtk: number,
  magAtk: number,
  physDef: number,
  magDef: number,
}

export type Treasure = {
  name: string
}

export type RoomRune = {
  name: string
}

export type Room = {
  name: string,
  intro: string,
  desc: string,
  sType: string,
  sEnemies: Array<Enemy>,
  sTreasure: Array<Treasure>,
  sLocked: boolean,
  sRune: RoomRune,
  paths: Array<string>
}

export type Effect = {
  name: string,
  hpBuff: number,
  duration: number,
  effectType: string,
  damageMult: number,
  physAtkBuffSelf: number,
  physAtkBuffParty: number,
  physAtkNerfEnemy: number,
  physAtkNerfEnemyParty: number,
  magAtkBuff: number,
  magAtkBuffParty: number,
  magAtkNerfEnemy: number,
  magAtkNerfEnemyParty: number,
  physDefBuff: number,
  physDefBuffParty: number,
  physDefNerfEnemy: number,
  physDefNerfEnemyParty: number,
  magDefBuff: number,
  magDefBuffParty: number,
  magDefNerfEnemy: number,
  magDefNerfEnemyParty: number,
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export function getCount(game: GameState) {
  return game.count;
}



const enemies = {
  'eWhiteGem': {
    name: 'White Gem',
    maxHp: 10,
    curHp: 10,
    physAtk: 5,
    magAtk: 5,
    physDef: 5,
    magDef: 5,
  }
}

const rooms = {
  'rTutorialRuneRoom': {
    name: 'Tutorial - Runes',
    intro: 'Mysterious etchings ahead',
    desc: 'In RUiNEd, you\'ll encounter runes! This one makes you stronger!',
    sType: 'rune',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialChoiceRoom']    
  },
  'rTutorialRestorationRoom':{
    name: 'Tutorial - Restoration',
    intro: 'The sound of water ahead',
    desc: 'In RUiNEd, you\'ll encounter fountains! They restore your health.',
    sType: 'restoration',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialRuneRoom']    
  },
  'rTutorialEnemyRoom':{
    name: 'Tutorial - Enemies',
    intro: 'Is that danger ahead?',
    desc: 'In RUiNEd, you\'ll encounter monsters! In this fight, try taking out the White Gem first!',
    sType: 'battle',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialRestorationRoom']  
  },
  'rTutorialTreasureRoom':{
    name: 'Tutorial - Treasure',
    intro: 'na',
    desc: 'In RUiNEd, you\'ll find treasure! Try it now!',
    sType: 'treasure',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialEnemyRoom']
  },
  'rTutorialChoiceRoom':{
    name: 'Tutorial - Choice',
    intro: 'The path forks ahead',
    desc: 'In RUiNEd, you\'ll sometimes have to choose which room to visit next!',
    sType: 'plain',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: []  
  }
}


Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (): GameState => {
    return { 
      count: 0,
      currentRoom: rooms['rTutorialTreasureRoom'],
      party: {},
      choiceState: 'inAction',
      choiceTimer: 60
    }
  },
  update: ({game}) => {
    //console.log(Rune.gameTimeInSeconds());
    if (game.choiceTimer > -1) {
      game.choiceTimer -= 1;
    }
  },
  actions: {
    increment: ({ amount }, { game }) => {
      game.count += amount
    },
    voteNextRoom: ({vote}, {game}) => {
      console.log('TODO');
    },
    changeRoom: ({newRoom},{game}) => {
      console.log('CHANGING ROOM TO ' + newRoom);
      game.currentRoom = rooms[newRoom];
    },
    skipToNextRoom: ({},{game}) => {
      game.choiceTimer = 10;
      game.choiceState = 'inVoteNext';
    }
  },
  events: {
    playerJoined: (playerId: string, {game}) => {
      console.log('player joined', game)
      console.log(Rune.actions)
      game.party[playerId] = {
        maxHp: 40,
        curHp: 40,
        physAtk: 10,
        magAtk: 10,
        physDef: 10,
        magDef: 10,
      }
    },
    playerLeft(playerId: string, {game}) {
      // Handle player left
      delete game.party[playerId]
    },
  },
})
