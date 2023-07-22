import type { RuneClient } from "rune-games-sdk/multiplayer"

export interface GameState {
  count: number,
  currentSite: object,
  party: { [key: string]: PartyMember },
}

type GameActions = {
  increment: (params: { amount: number }) => void
}

export type Party = {
  [key: string]: PartyMember,
}

export type PartyMember = {
  hp: number,
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export function getCount(game: GameState) {
  return game.count;
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (): GameState => {
    return { 
      count: 0,
      currentSite: {} ,
      party: {},
    }
  },
  actions: {
    increment: ({ amount }, { game }) => {
      game.count += amount
    },
  },
  events: {
    playerJoined: (playerId: string, {game}) => {
      console.log('player joined')
      game.party[playerId] = {
        hp: 40,

      }
    },
    playerLeft(playerId: string, {game}) {
      // Handle player left
      delete game.party[playerId]
    },
  },
})
