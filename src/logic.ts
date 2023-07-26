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
  voteNextRoom: (params: { vote: string }) => void
  changeRoom: (params: { newRoom: string }) => void
  chooseTreasure: (params: { treasureName: string, playerId: string, game: GameState }) => void
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
  equip: object
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
  name: string,
  slot: string,
  effects: Array<Effect>
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
  duration: number,
  effectType: string,
  magnitude: number,
  scope: string, // anyOne, self, party, enemy, enemyParty, all
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
  const candidates = {};
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


const treasure = {
  'Emerald Sword': {
    name: 'Emerald Sword',
    slot: 'weapon',
    effects: [
      { name: 'weaponStrBuff', duration: -1, magnitude: 4, scope: 'self', affectedStat: 'physAtk'  }
    ]
  },
  'Ruby Staff': {
    name: 'Ruby Staff',
    slot: 'weapon',
    effects: [
      { name: 'weaponMagBuff', duration: -1, magnitude: 4, scope: 'self', affectedStat: 'magAtk'}
    ]
  },
  'Mythril Mail': {
    name: 'Mythril Mail',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 4, scope: 'self', affectedStat: 'physDef'}
    ]
  },
  'Rainbow Robe': {
    name: 'Rainbow Robe',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 4, scope: 'self', affectedStat: 'magDef'}
    ]
  }
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

const rooms: [key: string] = {
  'rTutorialRuneRoom': {
    name: 'Tutorial - Runes',
    intro: 'Mysterious etchings ahead',
    desc: 'In RUiNEd, you\'ll encounter runes! This one makes you stronger!',
    sType: 'rune',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialChoiceRoom'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
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
    paths: ['rTutorialRuneRoom'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
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
    paths: ['rTutorialRestorationRoom'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {}, 
  },
  'rTutorialTreasureRoom':{
    name: 'Tutorial - Treasure',
    intro: 'na',
    desc: 'In RUiNEd, you\'ll find treasure! Try it now!',
    sType: 'treasure',
    sEnemies: [],
    sTreasure: [treasure['Emerald Sword'],treasure['Ruby Staff'],treasure['Mythril Mail'],treasure['Rainbow Robe']],
    sLocked: false,
    sRune: null,
    paths: ['rTutorialEnemyRoom'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
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
    paths: ['rWinRoom','rTutorialChoiceRoom'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rWinRoom':{
    name: 'Congrats!',
    intro: 'A light ahead?',
    desc: 'A light at the end of the ruins! You win!',
    sType: 'win',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: null,
    paths: [],
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
  
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (allPlayerIds): GameState => {
    const startingParty: Party = {};

    for (const playerId of allPlayerIds) {
      startingParty[playerId] = {
        maxHp: 40,
        curHp: 40,
        physAtk: 10,
        magAtk: 10,
        physDef: 10,
        magDef: 10,
        equip: {helm: '', armor: '', weapon: '', accessory: '', artifact: ''}
      };

    }
    return { 
      count: 0,
      currentRoom: rooms['rTutorialTreasureRoom'],
      party: startingParty,
      choiceState: 'inAction',
      choiceTimer: 60
    }
  },
  update: ({game}) => {
    console.log(game.choiceState + ': ' + game.choiceTimer)
    //console.log(Rune.gameTimeInSeconds());
    if (game.currentRoom.sType == 'win') {
      const pW = {};
      for (const i of Object.keys(game.party)) {
        pW[i] = 'WON';
      }
      Rune.gameOver({
        players: pW,
        delayPopUp: true,
      })
    }
    //if (game.choiceTimer > -1) {
      game.choiceTimer -= 1;
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
        if (wholePartyChoseItem(game)) {
          game.choiceTimer = 0;
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
    skipToNextRoom: ({},{game}) => {
      game.choiceTimer = 10;
      game.choiceState = 'inVoteNext';
    },
    chooseTreasure: ({playerId, treasureName},{game}) => {
      if (!game.currentRoom.choseItem[playerId]) {
        const slot = treasure[treasureName].slot;
        game.party[playerId].equip[slot] = treasureName;
        game.currentRoom.choseItem[playerId] = true;
      }
      else throw Rune.invalidAction();
    },
    votePath: ({playerId, pathName},{game}) => {
      game.currentRoom.pathVotes[playerId] = pathName;
    },
    winBattle: ({},{game}) => {
      for (const i of Object.keys(game.party)) {
        game.party[i].curHp = game.party[i].maxHp;
        game.currentRoom.choseItem[i] = true;
      }
    },
    ackRestoration: ({},{game}) => {
      for (const i of Object.keys(game.party)) {
        game.party[i].curHp = game.party[i].maxHp;
        game.currentRoom.choseItem[i] = true;
      }
    },
    ackRune: ({},{game}) => {
      for (const i of Object.keys(game.party)) {
        game.currentRoom.choseItem[i] = true;
      }
    },
    ackPlain: ({},{game}) => {
      for (const i of Object.keys(game.party)) {
        game.currentRoom.choseItem[i] = true;
      }
    },
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
        equip: {helm: '', armor: '', weapon: '', accessory: '', artifact: ''}
      }
    },
    playerLeft(playerId: string, {game}) {
      // Handle player left
      delete game.party[playerId]
    },
  },
})
