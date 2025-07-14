import { Player } from '../types'

export class PlayerManager {
  private players: Map<string, Player> = new Map()

  createPlayer(id: string, name: string, avatarUrl?: string): Player {
    const player: Player = {
      id,
      name,
      avatarUrl,
      isHost: false,
      isReady: false,
      score: 0,
      joinedAt: new Date()
    }
    this.players.set(id, player)
    return player
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId)
  }

  updatePlayer(playerId: string, updates: Partial<Player>): Player | undefined {
    const player = this.players.get(playerId)
    if (player) {
      const updatedPlayer = { ...player, ...updates }
      this.players.set(playerId, updatedPlayer)
      return updatedPlayer
    }
    return undefined
  }

  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId)
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  getPlayersByRoom(_roomId: string): Player[] {
    // This would typically filter by room association
    return this.getAllPlayers()
  }
}