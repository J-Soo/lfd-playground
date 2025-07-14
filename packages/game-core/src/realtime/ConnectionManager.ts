export class ConnectionManager {
  private connectionState: 'connected' | 'disconnected' | 'connecting' = 'disconnected'
  private listeners: Map<string, Function[]> = new Map()

  getConnectionState() {
    return this.connectionState
  }

  setConnectionState(state: 'connected' | 'disconnected' | 'connecting') {
    this.connectionState = state
    this.emit('stateChange', state)
  }

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args))
    }
  }
}