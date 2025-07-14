export interface Player {
  id: string
  name: string
  avatarUrl?: string
  isHost: boolean
  isReady: boolean
  score: number
  joinedAt: Date
}

export interface Room {
  id: string
  hostId: string
  players: Player[]
  state: 'waiting' | 'playing' | 'finished'
  settings: RoomSettings
  createdAt: Date
  updatedAt: Date
}

export interface RoomSettings {
  maxPlayers?: number
  minPlayers?: number
  timeLimit?: number
  isPrivate?: boolean
  gameMode?: string
  [key: string]: any
}

export interface GameState {
  roomId: string
  currentRound: number
  phase: string
  data: any
}

export interface GameAction {
  type: string
  playerId: string
  payload: any
  timestamp: Date
}