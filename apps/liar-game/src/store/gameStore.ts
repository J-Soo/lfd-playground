import { create } from 'zustand'
import { LiarGamePlayer, LiarGameState, GameAction } from '../types/game'
import { LIAR_GAME_WORDS } from '../constants/gameData'

interface GameStore {
  // State
  roomCode: string
  playerId: string
  players: LiarGamePlayer[]
  gameState: LiarGameState
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  isHost: boolean

  // Actions
  setRoomCode: (code: string) => void
  setPlayerId: (id: string) => void
  setPlayers: (players: LiarGamePlayer[]) => void
  updateGameState: (state: Partial<LiarGameState>) => void
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  setIsHost: (isHost: boolean) => void
  
  // Game logic
  handleGameAction: (action: GameAction) => void
  startNewRound: () => void
  submitAnswer: (answer: string) => void
  submitVote: (targetId: string) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  roomCode: '',
  playerId: '',
  players: [],
  gameState: {
    phase: 'waiting',
    category: '',
    keyword: '',
    liarId: '',
    currentRound: 0,
    totalRounds: 5,
    timeLeft: 0,
    winners: []
  },
  connectionStatus: 'connecting',
  isHost: false,

  // Basic setters
  setRoomCode: (code) => set({ roomCode: code }),
  setPlayerId: (id) => set({ playerId: id }),
  setPlayers: (players) => set({ players }),
  updateGameState: (state) => set((prev) => ({ 
    gameState: { ...prev.gameState, ...state } 
  })),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setIsHost: (isHost) => set({ isHost }),

  // Game action handler
  handleGameAction: (action) => {
    const state = get()
    
    switch (action.type) {
      case 'START_GAME':
        set({
          gameState: {
            ...state.gameState,
            phase: 'category-reveal',
            currentRound: 1
          }
        })
        break

      case 'REVEAL_CATEGORY':
        set({
          gameState: {
            ...state.gameState,
            phase: 'playing',
            category: action.category,
            keyword: action.keyword,
            liarId: action.liarId,
            timeLeft: 180 // 3 minutes
          }
        })
        break

      case 'SUBMIT_ANSWER':
        set({
          players: state.players.map(p => 
            p.id === action.playerId 
              ? { ...p, hasAnswered: true, answer: action.answer }
              : p
          )
        })
        
        // Check if all players answered
        const allAnswered = state.players.every(p => p.hasAnswered)
        if (allAnswered) {
          set({
            gameState: { ...state.gameState, phase: 'voting' }
          })
        }
        break

      case 'START_VOTING':
        set({
          gameState: { ...state.gameState, phase: 'voting' }
        })
        break

      case 'SUBMIT_VOTE':
        set({
          players: state.players.map(p => 
            p.id === action.playerId 
              ? { ...p, votedFor: action.votedFor }
              : p
          )
        })
        
        // Check if all players voted
        const allVoted = state.players.every(p => p.votedFor)
        if (allVoted) {
          set({
            gameState: { ...state.gameState, phase: 'reveal' }
          })
        }
        break

      case 'REVEAL_LIAR':
        set({
          gameState: { ...state.gameState, phase: 'reveal' }
        })
        break

      case 'END_ROUND':
        set({
          gameState: { 
            ...state.gameState, 
            phase: 'results',
            winners: action.winners
          }
        })
        break

      case 'NEXT_ROUND':
        const nextRound = state.gameState.currentRound + 1
        if (nextRound > state.gameState.totalRounds) {
          set({
            gameState: { ...state.gameState, phase: 'results' }
          })
        } else {
          set({
            gameState: {
              ...state.gameState,
              phase: 'category-reveal',
              currentRound: nextRound,
              category: '',
              keyword: '',
              liarId: '',
              winners: []
            },
            players: state.players.map(p => ({
              ...p,
              hasAnswered: false,
              answer: undefined,
              votedFor: undefined,
              isLiar: false
            }))
          })
        }
        break

      case 'END_GAME':
        set({
          gameState: { ...state.gameState, phase: 'results' }
        })
        break
    }
  },

  // Helper methods
  startNewRound: () => {
    const state = get()
    if (!state.isHost) return

    // Select random category and keyword
    const categories = Object.keys(LIAR_GAME_WORDS)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const words = LIAR_GAME_WORDS[category]
    const keyword = words[Math.floor(Math.random() * words.length)]
    
    // Select random liar
    const liarIndex = Math.floor(Math.random() * state.players.length)
    const liarId = state.players[liarIndex].id

    // This would be sent via realtime channel
    return { category, keyword, liarId }
  },

  submitAnswer: (answer) => {
    const state = get()
    const action: GameAction = {
      type: 'SUBMIT_ANSWER',
      playerId: state.playerId,
      answer
    }
    // This will be sent via useRealtimeGame hook
    return action
  },

  submitVote: (targetId) => {
    const state = get()
    const action: GameAction = {
      type: 'SUBMIT_VOTE',
      playerId: state.playerId,
      votedFor: targetId
    }
    // This will be sent via useRealtimeGame hook
    return action
  }
}))