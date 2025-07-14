import { createContext, useContext, ReactNode, useState } from 'react'

type GameState = 'waiting' | 'playing' | 'voting' | 'results'

interface GameContextType {
  gameState: GameState
  setGameState: (state: GameState) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>('waiting')

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}