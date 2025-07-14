import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { roomId, playerId, action, payload } = await req.json()

    // Validate player is in room
    const { data: roomPlayer, error: roomPlayerError } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .eq('player_id', playerId)
      .single()

    if (roomPlayerError || !roomPlayer) {
      throw new Error('Player not in room')
    }

    // Get current game state
    const { data: gameState, error: gameStateError } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (gameStateError) {
      throw new Error('Game state not found')
    }

    // Process action based on game phase
    let updatedState = { ...gameState.state_data }
    
    switch (action) {
      case 'submit_answer':
        if (gameState.phase !== 'playing') {
          throw new Error('Invalid game phase for this action')
        }
        updatedState.answers = updatedState.answers || {}
        updatedState.answers[playerId] = payload.answer
        break
        
      case 'vote':
        if (gameState.phase !== 'voting') {
          throw new Error('Invalid game phase for this action')
        }
        updatedState.votes = updatedState.votes || {}
        updatedState.votes[playerId] = payload.targetPlayerId
        break
        
      default:
        throw new Error('Unknown action')
    }

    // Update game state
    const { error: updateError } = await supabase
      .from('game_states')
      .update({ state_data: updatedState })
      .eq('id', gameState.id)

    if (updateError) {
      throw new Error('Failed to update game state')
    }

    return new Response(
      JSON.stringify({ success: true, state: updatedState }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})