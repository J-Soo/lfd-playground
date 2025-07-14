export const GAME_CONSTANTS = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 8,
  DEFAULT_TIME_LIMIT: 180, // 3 minutes in seconds
  DEFAULT_ROUNDS: 5,
  RECONNECT_TIMEOUT: 30000, // 30 seconds
  HEARTBEAT_INTERVAL: 5000, // 5 seconds
} as const

export const GAME_STATES = {
  WAITING: 'waiting',
  STARTING: 'starting',
  PLAYING: 'playing',
  VOTING: 'voting',
  RESULTS: 'results',
  FINISHED: 'finished',
} as const

export const PLAYER_STATES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  READY: 'ready',
  NOT_READY: 'not_ready',
} as const

export const MESSAGE_TYPES = {
  CHAT: 'chat',
  SYSTEM: 'system',
  GAME_EVENT: 'game_event',
  PLAYER_ACTION: 'player_action',
} as const

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  INVALID_ROOM_CODE: 'INVALID_ROOM_CODE',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
  INVALID_ACTION: 'INVALID_ACTION',
} as const