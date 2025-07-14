export class StateSync<T> {
  private state: T
  private subscribers: ((state: T) => void)[] = []

  constructor(initialState: T) {
    this.state = initialState
  }

  getState(): T {
    return this.state
  }

  setState(newState: Partial<T>) {
    this.state = { ...this.state, ...newState }
    this.notifySubscribers()
  }

  subscribe(callback: (state: T) => void): () => void {
    this.subscribers.push(callback)
    callback(this.state)
    
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state))
  }
}