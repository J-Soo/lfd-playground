import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeService {
  private supabase: SupabaseClient
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  subscribeToRoom(roomId: string, handlers: {
    onPresenceSync?: () => void
    onPresenceJoin?: (payload: any) => void
    onPresenceLeave?: (payload: any) => void
    onBroadcast?: (payload: any) => void
  }) {
    const channelName = `room:${roomId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, handlers.onPresenceSync || (() => {}))
      .on('presence', { event: 'join' }, handlers.onPresenceJoin || (() => {}))
      .on('presence', { event: 'leave' }, handlers.onPresenceLeave || (() => {}))
      .on('broadcast', { event: '*' }, handlers.onBroadcast || (() => {}))
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  unsubscribeFromRoom(roomId: string) {
    const channelName = `room:${roomId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  broadcast(roomId: string, event: string, payload: any) {
    const channelName = `room:${roomId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }

  updatePresence(roomId: string, state: any) {
    const channelName = `room:${roomId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.track(state)
    }
  }

  cleanupAll() {
    this.channels.forEach(channel => channel.unsubscribe())
    this.channels.clear()
  }
}