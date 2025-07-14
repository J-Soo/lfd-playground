import { Room, Player } from '../types'

export class SessionValidator {
  validateRoomJoin(room: Room, player: Player): { valid: boolean; reason?: string } {
    if (!room) {
      return { valid: false, reason: 'Room does not exist' }
    }

    if (room.state !== 'waiting') {
      return { valid: false, reason: 'Game already in progress' }
    }

    const maxPlayers = room.settings.maxPlayers || 8
    if (room.players.length >= maxPlayers) {
      return { valid: false, reason: 'Room is full' }
    }

    if (room.players.some(p => p.id === player.id)) {
      return { valid: false, reason: 'Player already in room' }
    }

    return { valid: true }
  }

  validateGameStart(room: Room): { valid: boolean; reason?: string } {
    if (!room) {
      return { valid: false, reason: 'Room does not exist' }
    }

    const minPlayers = room.settings.minPlayers || 3
    if (room.players.length < minPlayers) {
      return { valid: false, reason: `Need at least ${minPlayers} players` }
    }

    if (!room.players.every(p => p.isReady || p.isHost)) {
      return { valid: false, reason: 'Not all players are ready' }
    }

    return { valid: true }
  }

  validatePlayerAction(room: Room, playerId: string, _action: string): { valid: boolean; reason?: string } {
    const player = room.players.find(p => p.id === playerId)
    if (!player) {
      return { valid: false, reason: 'Player not in room' }
    }

    // Add game-specific validation logic here
    return { valid: true }
  }
}