export interface LiarGamePlayer {
  id: string
  name: string
  isHost: boolean
  isLiar: boolean
  hasAnswered: boolean
  answer?: string
  votedFor?: string
  score: number
}

export interface LiarGameState {
  phase: 'waiting' | 'category-reveal' | 'playing' | 'voting' | 'reveal' | 'results'
  category: string
  keyword: string
  liarId: string
  currentRound: number
  totalRounds: number
  timeLeft: number
  winners: string[]
}

export interface LiarGameSettings {
  timePerRound: number
  totalRounds: number
  categories: string[]
}

export type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'REVEAL_CATEGORY'; category: string; keyword: string; liarId: string }
  | { type: 'SUBMIT_ANSWER'; playerId: string; answer: string }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; playerId: string; votedFor: string }
  | { type: 'REVEAL_LIAR' }
  | { type: 'END_ROUND'; winners: string[] }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }