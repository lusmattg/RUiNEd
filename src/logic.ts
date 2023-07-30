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
  chooseTreasure: (params: { treasureName: string, playerId: string}) => void
  votePath: (params: {pathName: string, playerId: string}) => void;
  ackRestoration: (params: {playerId: string, accepted: boolean}) => void;
  winBattle: (params: {playerId: string}) => void;
  ackPlain: (params: {playerId: string, accepted: boolean}) => void;
  choosePower: (params: {power: string, playerId: string}) => void;
  chooseRune: (params: {rune: string, playerId: string}) => void;
  attack: (params: {playerId: string, enemyName: string, attack: string}) => void;
}

export type Battle = {
  enemies: Array<Enemy>,
  log: string,
  initiative: Record<string, number>,
}

export type Party = {
  [key: string]: PartyMember,
}

export type Equipment = {
  helm: string,
  armor: string,
  weapon: string,
  accessory: string,
}

export type PartyMember = {
  maxHp: number,
  curHp: number,
  atk: number,
  def: number,
  spd: number,
  equip: Equipment,
  powers: Array<string>,
  runes: Array<string>,
}

export type Enemy = {
  name: string,
  maxHp: number,
  curHp: number,
  atk: number,
  def: number,
  spd: number,
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
  let z = 0;
  if (s) z = z + 1;
  if (z) {
    //
  }
}


const treasure: Record<string, Treasure> = {
  'Emerald Sword': {
    name: 'Emerald Sword',
    slot: 'weapon',
    effects: [
      { name: 'weaponStrBuff', duration: -1, magnitude: 1.2, scope: 'self', affectedStat: 'atk'  }
    ]
  },
  'Ruby Staff': {
    name: 'Ruby Staff',
    slot: 'weapon',
    effects: [
      { name: 'weaponMagBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'atk'}
    ]
  },
  'Mythril Mail': {
    name: 'Mythril Mail',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.2, scope: 'self', affectedStat: 'def'}
    ]
  },
  'Rainbow Robe': {
    name: 'Rainbow Robe',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'def'}
    ]
  },
  'Party Helm': {
    name: 'Party Helm',
    slot: 'helm',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.1, scope: 'self', affectedStat: 'def'}
    ]
  },
  'Pinata Armor': {
    name: 'Pinata Armor',
    slot: 'armor',
    effects: [
      { name: 'armorDefBuff', duration: -1, magnitude: 1.15, scope: 'self', affectedStat: 'def'}
    ]
  },
  'Champagne Saber': {
    name: 'Champagne Saber',
    slot: 'weapon',
    effects: [
      { name: 'weaponAtkBuff', duration: -1, magnitude: 1.15, scope: 'self', affectedStat: 'atk'}
    ]
  },
  'Balloon Lightning': {
    name: 'Balloon Lightning',
    slot: 'accessory',
    effects: [
      { name: 'weaponAtkBuff', duration: -1, magnitude: 1.15, scope: 'self', affectedStat: 'atk'}
    ]
  }


}

export const powers: Record<string, Array<Effect>> = {
  'Heal':[{name: 'Heal', duration: -1, magnitude: 2, scope: 'ally', affectedStat: 'curHp'}],
  'Death Darts':[{name: 'Death Darts', duration: -1, magnitude: 1.5, scope: 'enemyParty', affectedStat: 'curHp'}],
  'Punch': [{name: 'Punch', duration: -1, magnitude: 0.8, scope: 'enemy', affectedStat: 'curHp'}],
  'Slay': [{name: 'Slay', duration: -1, magnitude: 5, scope: 'enemy', affectedStat: 'curHp'}],
  'Restore All': [{name: 'Restore All', duration: -1, magnitude: 0.5, scope: 'party', affectedStat: 'curHp'}],
}

export const runes: Record<string, Array<Effect>> = {
  'Might Rune': [{name: 'Might Rune', duration: -1, magnitude: 1, scope: 'self', affectedStat: 'atk'}],
  'Shield Rune': [{name: 'Shield Rune', duration: -1, magnitude: 1, scope: 'self', affectedStat: 'def'}],
  'Health Rune': [{name: 'Health Rune', duration: -1, magnitude: 1, scope: 'self', affectedStat: 'maxHp'}],
  'Speed Rune': [{name: 'Speed Rune', duration: -1, magnitude: 1, scope: 'self', affectedStat: 'spd'}],
}

const enemies: Record<string, Enemy> = {
  'Ogre': {
    name: 'Ogre',
    maxHp: 50,
    curHp: 50,
    atk: 5,
    def: 5,
    spd: 0.25,
    attacks: {
      'Smash': [
        { name: 'Ogre Smash', duration: -1, magnitude: 5, scope: 'party', affectedStat: 'curHp' },
      ]
    }
  },
  'Gnat Swarm': {
    name: 'Gnat Swarm',
    maxHp: 10,
    curHp: 10,
    atk: 1,
    def: 1,
    spd: 2.5,
    attacks: {
      'Bite': [
        { name: 'Gnat Bite', duration: -1, magnitude: 1, scope: 'player', affectedStat: 'curHp' },
      ]
    }
  },
  'eGreenGem': {
    name: 'Green Gem',
    maxHp: 10,
    curHp: 10,
    atk: 1,
    def: 5,
    spd: 1,
    attacks: {
      'Heal': [
        { name: 'Green Gem Heal', duration: -1, magnitude: -10, scope: 'enemyParty', affectedStat: 'curHp' },
      ]
    }
  },
}

doNothingWith(JSON.stringify(enemies)); //TODO: remove

const rooms: Record<string, Room> = {
  'rLobby': {
    name: 'Lobby',
    desc: 'Welcome to RUiNEd, a game where you and your PaRtY explore dangerous ruins. Try the tutorial! Full game coming soon.',
    sType: 'lobby',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: [],
    sPowers: [],
    paths: ['rTutorialTreasureRoom'],
    pathIntros: ['Treasure awaits in the Tutorial!'],
    pathVotes: {},
    choseItem: {},
    choseUpgrade: {},
  },
  'rTutorialRuneRoom': {
    name: 'Tutorial - Runes',
    desc: 'In RUiNEd, you\'ll encounter runes! This one makes you stronger!',
    sType: 'rune',
    sEnemies: [],
    sTreasure: [],
    sLocked: false,
    sRune: ['Might Rune','Shield Rune','Health Rune','Speed Rune'],
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
    desc: 'In RUiNEd, you\'ll encounter monsters! In this fight, take out the Ogre before it can hit you!',
    sType: 'battle',
    sEnemies: ['Ogre','Gnat Swarm','eGreenGem'],
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
    sTreasure: [treasure['Party Helm'],treasure['Pinata Armor'],treasure['Champagne Saber'],treasure['Balloon Lightning']],
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
    sPowers: ['Heal', 'Death Darts','Slay','Restore All'],
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
        atk: enemies[e].atk,
        def: enemies[e].def,
        spd: enemies[e].spd,
        attacks: enemies[e].attacks
      };
      game.battle.enemies.push(enemy);
    }
    game.battle.log = '';
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

const getEquipBuffs = (stat: string, playerId: string, game: GameState) => {
  let result = 1;
  for (const b of Object.values(game.party[playerId].equip)) {
    const equip = treasure[b]; 
    if (equip && equip.effects) {
      for (const e of equip.effects) {
        if (e.affectedStat == stat) result *= e.magnitude;
      }
    }
  }

  return result;
}

const getRuneBuffs = (stat: string, playerId: string, game: GameState) => {
  let result = 0;

  for (const b of Object.values(game.party[playerId].runes)) {
    const run = runes[b]; 
    for (const e of run) {
      if (e.affectedStat == stat) result += e.magnitude;
    }
  }
  return result;

}

const resolveImmediateAttack = (e: Effect, playerId: string, enemyName: string, attackName: string, game: GameState) => {
  doNothingWith(playerId);
  const pl = game.party[playerId];
  const dmg = Math.floor((pl['atk'] + getRuneBuffs('atk',playerId,game)) * getEquipBuffs('atk',playerId,game) * e.magnitude);
  
  doNothingWith(attackName);
  if (e.affectedStat == 'curHp') {
    const enemyId: number = getBattleEnemyId(enemyName, game);
    game.battle.enemies[enemyId].curHp -= dmg;
    if (game.battle.enemies[enemyId].curHp < 0) game.battle.enemies[enemyId].curHp = 0;
    if (game.battle.enemies[enemyId].curHp > game.battle.enemies[enemyId].maxHp) game.battle.enemies[enemyId].curHp = game.battle.enemies[enemyId].maxHp;
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
    //
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
  for (const e of pow) {
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
          if (en.curHp > 0) resolveImmediateAttack(e, playerId, en.name, attack, game);
        }
      }
    }
    else if (e.scope == 'all') {
      //
    }
    else {
      //
    }
  }

}

const resolveEnemyAttack = (e: Effect, target: string, enemyName: string, attackName: string, game: GameState) => {
  doNothingWith(attackName);
  const enemyId: number = getBattleEnemyId(enemyName, game);
  const enemy = game.battle.enemies[enemyId];
  const dmg = enemy.atk * e.magnitude;
  if (e.affectedStat == 'curHp') {
    game.party[target].curHp -= dmg;
    if (game.party[target].curHp < 0) game.party[target].curHp = 0;
    if (game.party[target].curHp > game.party[target].maxHp) game.party[target].curHp = game.party[target].maxHp;
    if (dmg >= 0) {
      const l = '\n' + enemyName + ' dealt ' + dmg + ' damage';
      game.battle.log += l;
    }
    else {
      const l = '\n' + enemyName + ' healed ' + dmg + ' damage';
      game.battle.log += l;
    }
  }
}

const resolveEnemyHeal = (e: Effect, target: string, enemyName: string, attackName: string, game: GameState) => {
  doNothingWith(attackName);
  const enemyId: number = getBattleEnemyId(enemyName, game);
  const enemy = game.battle.enemies[enemyId];
  const dmg = enemy.atk * e.magnitude;
  if (e.affectedStat == 'curHp') {
    const targetId: number = getBattleEnemyId(target, game);
    const tg = game.battle.enemies[targetId];
    if (tg.curHp < 0) return;
    tg.curHp -= dmg;
    if (tg.curHp < 0) tg.curHp = 0;
    if (tg.curHp > tg.maxHp) tg.curHp = tg.maxHp;
    if (dmg >= 0) {
      const l = '\n' + enemyName + ' dealt ' + dmg + ' damage';
      game.battle.log += l;
    }
    else {
      const l = '\n' + enemyName + ' healed ' + dmg + ' damage';
      game.battle.log += l;
    }
  }
}

const battleEnemyTurn = (enemyName: string, game: GameState) => {
  const enemyId: number = getBattleEnemyId(enemyName, game);
  const enemy = game.battle.enemies[enemyId];
  if (enemy.curHp <= 0) return;
  const attacks = enemy.attacks;
  let attack: Effect = {name: 'none', affectedStat: 'none', magnitude: 0, duration: 0, scope: 'none'};
  if (attacks)
    for (const a of Object.values(attacks)) {
      attack = a[0];
    }

  if (attack.scope == 'enemyParty') {
    //
    const targets = game.battle.enemies;
    for (const t of targets) {
      resolveEnemyHeal(attack, t.name, enemyName, attack.name, game)
    }
  }
  else if (attack.scope == 'party') {
    //
    const targets = Object.keys(game.party);
    for (const p of targets) {
      resolveEnemyAttack(attack, p, enemyName, attack.name, game )
    }
  }
  else if (attack.scope == 'player') {
    //
    const targets = Object.keys(game.party);
    const randTarget = Math.floor(Math.random() * targets.length);
    const target = targets[randTarget];
    resolveEnemyAttack(attack, target, enemyName, attack.name, game);
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
        atk: 10,
        def: 10,
        spd: 1,
        equip: {helm: '', armor: '', weapon: '', accessory: ''},
        powers: ['Punch'],
        runes: [],
      };

    }
    return { 
      count: 0,
      //currentRoom: rooms['rTutorialTreasureRoom'],
      //currentRoom: rooms['rTutorialTeacherRoom'],
      currentRoom: rooms['rLobby'],
      party: startingParty,
      choiceState: 'inAction',
      choiceTimer: 600,
      battle: {enemies: [], log: '', initiative: {}},
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
        delayPopUp: false,
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
          delayPopUp: false,
        })  
      }
      else {
        game.choiceTimer = 60;
        for (const p of Object.keys(game.party)) {
          if (!game.battle.initiative[p]) game.battle.initiative[p] = 0;
          if (game.party[p].curHp > 0) game.battle.initiative[p] += (getRuneBuffs('spd',p,game) + game.party[p].spd);
        }

        for (const e of game.battle.enemies) {
          if (!game.battle.initiative[e.name]) game.battle.initiative[e.name] = 0;
          if (e.curHp > 0) { 
            game.battle.initiative[e.name] += e.spd;
            if (game.battle.initiative[e.name] >= 5) {
              battleEnemyTurn(e.name, game);
              game.battle.initiative[e.name] = 0;
            }
          }
        }
      }
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
    ackPlain: ({playerId, accepted},{game}) => {
      if (accepted) game.currentRoom.choseItem[playerId] = true;
    },
    attack: ({playerId, enemyName, attack},{game}) => {
      if (game.battle.initiative[playerId] >=5) { 
        handleAttack(playerId, enemyName, attack, game);
        game.battle.initiative[playerId] = 0;
      }
      else throw Rune.invalidAction();
    }
  },
  events: {
    playerJoined: (playerId: string, {game}) => {
      game.party[playerId] = {
        maxHp: 40,
        curHp: 40,
        atk: 10,
        def: 10,
        spd: 1,
        equip: {helm: '', armor: '', weapon: '', accessory: ''},
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
