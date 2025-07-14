import { Room, Player } from '../types'

export class RoomManager {
  private rooms: Map<string, Room> = new Map()

  createRoom(roomId: string, hostId: string, settings?: any): Room {
    const room: Room = {
      id: roomId,
      hostId,
      players: [],
      state: 'waiting',
      settings: settings || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.rooms.set(roomId, room)
    return room
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  updateRoom(roomId: string, updates: Partial<Room>): Room | undefined {
    const room = this.rooms.get(roomId)
    if (room) {
      const updatedRoom = { ...room, ...updates, updatedAt: new Date() }
      this.rooms.set(roomId, updatedRoom)
      return updatedRoom
    }
    return undefined
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId)
  }

  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId)
    if (room) {
      room.players.push(player)
      room.updatedAt = new Date()
      return true
    }
    return false
  }

  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId)
    if (room) {
      room.players = room.players.filter(p => p.id !== playerId)
      room.updatedAt = new Date()
      return true
    }
    return false
  }
}