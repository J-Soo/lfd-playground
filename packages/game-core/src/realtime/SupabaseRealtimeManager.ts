import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export class SupabaseRealtimeManager {
  private supabase: SupabaseClient
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  subscribeToChannel(channelName: string): RealtimeChannel {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = this.supabase.channel(channelName)
    this.channels.set(channelName, channel)
    return channel
  }

  unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  broadcastMessage(channelName: string, event: string, payload: any): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }

  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe())
    this.channels.clear()
  }
}