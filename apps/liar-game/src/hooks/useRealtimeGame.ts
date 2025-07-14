import { useEffect, useCallback, useRef } from 'react'
import { createSupabaseClient } from '@lfd-playground/supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useGameStore } from '../store/gameStore'
import type { LiarGamePlayer, GameAction } from '../types/game'

export function useRealtimeGame(roomCode: string, playerId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createSupabaseClient()
  const { 
    setPlayers, 
    updateGameState, 
    handleGameAction,
    setConnectionStatus 
  } = useGameStore()

  const sendGameAction = useCallback((action: GameAction) => {
    if (!channelRef.current) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'game_action',
      payload: { action, playerId, timestamp: Date.now() }
    })
  }, [playerId])

  useEffect(() => {
    if (!roomCode || !playerId) return

    const channel = supabase
      .channel(`liar-game:${roomCode}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const players: LiarGamePlayer[] = []
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach(presence => {
            players.push(presence.player)
          })
        })
        
        setPlayers(players)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Player joined:', key)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Player left:', key)
      })
      .on('broadcast', { event: 'game_action' }, ({ payload }) => {
        handleGameAction(payload.action)
      })
      .on('broadcast', { event: 'game_state_sync' }, ({ payload }) => {
        updateGameState(payload.state)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
          
          // Track player presence
          await channel.track({
            player: {
              id: playerId,
              name: `Player ${playerId.slice(0, 4)}`,
              isHost: false,
              isLiar: false,
              hasAnswered: false,
              score: 0
            },
            online_at: new Date().toISOString()
          })
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected')
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error')
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [roomCode, playerId, supabase, setPlayers, updateGameState, handleGameAction, setConnectionStatus])

  return { sendGameAction }
}