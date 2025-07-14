import { useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { LIAR_GAME_WORDS } from '../constants/gameData'
import type { GameAction } from '../types/game'

export function useGameHost(sendGameAction: (action: GameAction) => void) {
  const { 
    isHost, 
    players, 
    gameState,
    startNewRound 
  } = useGameStore()

  const startGame = useCallback(() => {
    if (!isHost || players.length < 3) return
    
    sendGameAction({ type: 'START_GAME' })
    
    // Start first round after a delay
    setTimeout(() => {
      const roundData = startNewRound()
      if (roundData) {
        sendGameAction({
          type: 'REVEAL_CATEGORY',
          category: roundData.category,
          keyword: roundData.keyword,
          liarId: roundData.liarId
        })
      }
    }, 2000)
  }, [isHost, players.length, sendGameAction, startNewRound])

  const checkAllAnswered = useCallback(() => {
    if (!isHost) return
    
    const allAnswered = players.every(p => p.hasAnswered)
    if (allAnswered && gameState.phase === 'playing') {
      sendGameAction({ type: 'START_VOTING' })
    }
  }, [isHost, players, gameState.phase, sendGameAction])

  const checkAllVoted = useCallback(() => {
    if (!isHost) return
    
    const allVoted = players.every(p => p.votedFor)
    if (allVoted && gameState.phase === 'voting') {
      sendGameAction({ type: 'REVEAL_LIAR' })
      
      // Calculate winners
      const voteCount: Record<string, number> = {}
      players.forEach(player => {
        if (player.votedFor) {
          voteCount[player.votedFor] = (voteCount[player.votedFor] || 0) + 1
        }
      })
      
      const mostVoted = Object.entries(voteCount).reduce((a, b) => 
        voteCount[a[0]] > voteCount[b[0]] ? a : b
      )[0]
      
      const liarCaught = mostVoted === gameState.liarId
      const winners = liarCaught 
        ? players.filter(p => !p.isLiar).map(p => p.id)
        : [gameState.liarId]
      
      setTimeout(() => {
        sendGameAction({ type: 'END_ROUND', winners })
      }, 5000)
    }
  }, [isHost, players, gameState.phase, gameState.liarId, sendGameAction])

  const startNextRound = useCallback(() => {
    if (!isHost) return
    
    if (gameState.currentRound < gameState.totalRounds) {
      sendGameAction({ type: 'NEXT_ROUND' })
      
      setTimeout(() => {
        const roundData = startNewRound()
        if (roundData) {
          sendGameAction({
            type: 'REVEAL_CATEGORY',
            category: roundData.category,
            keyword: roundData.keyword,
            liarId: roundData.liarId
          })
        }
      }, 2000)
    } else {
      sendGameAction({ type: 'END_GAME' })
    }
  }, [isHost, gameState.currentRound, gameState.totalRounds, sendGameAction, startNewRound])

  // Monitor game state changes
  useEffect(() => {
    if (!isHost) return
    
    if (gameState.phase === 'playing') {
      checkAllAnswered()
    } else if (gameState.phase === 'voting') {
      checkAllVoted()
    }
  }, [isHost, gameState.phase, checkAllAnswered, checkAllVoted])

  return {
    startGame,
    startNextRound
  }
}