export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          user_id: string
          name: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          avatar_url?: string
          created_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          room_id: string
          game_id: string
          state: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          game_id: string
          state: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          game_id?: string
          state?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}