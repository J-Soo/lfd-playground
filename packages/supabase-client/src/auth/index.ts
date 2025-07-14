import { SupabaseClient } from '@supabase/supabase-js'

export class AuthService {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  async signInAnonymously() {
    const { data, error } = await this.supabase.auth.signInAnonymously()
    return { data, error }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession()
    return { data, error }
  }

  async getUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}