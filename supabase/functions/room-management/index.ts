import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
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

    const { action, ...params } = await req.json()

    switch (action) {
      case 'create': {
        const { gameId, playerId, settings } = params
        
        // Generate unique room code
        let roomCode: string
        let attempts = 0
        do {
          roomCode = generateRoomCode()
          const { data: existing } = await supabase
            .from('rooms')
            .select('id')
            .eq('code', roomCode)
            .single()
          
          if (!existing) break
          attempts++
        } while (attempts < 10)

        // Create room
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert({
            code: roomCode,
            game_id: gameId,
            host_id: playerId,
            settings: settings || {},
            max_players: settings?.maxPlayers || 8
          })
          .select()
          .single()

        if (roomError) throw roomError

        // Add host to room
        const { error: joinError } = await supabase
          .from('room_players')
          .insert({
            room_id: room.id,
            player_id: playerId,
            is_ready: true
          })

        if (joinError) throw joinError

        return new Response(
          JSON.stringify({ room }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'join': {
        const { roomCode, playerId } = params

        // Find room
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single()

        if (roomError || !room) {
          throw new Error('Room not found')
        }

        if (room.state !== 'waiting') {
          throw new Error('Game already in progress')
        }

        // Check room capacity
        const { count } = await supabase
          .from('room_players')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)

        if (count >= room.max_players) {
          throw new Error('Room is full')
        }

        // Add player to room
        const { error: joinError } = await supabase
          .from('room_players')
          .insert({
            room_id: room.id,
            player_id: playerId
          })

        if (joinError) {
          if (joinError.code === '23505') { // Unique violation
            return new Response(
              JSON.stringify({ room, alreadyJoined: true }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw joinError
        }

        return new Response(
          JSON.stringify({ room }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'start': {
        const { roomId, playerId } = params

        // Verify player is host
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .eq('host_id', playerId)
          .single()

        if (roomError || !room) {
          throw new Error('Unauthorized or room not found')
        }

        // Update room state
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ state: 'playing' })
          .eq('id', roomId)

        if (updateError) throw updateError

        // Create initial game state
        const { error: stateError } = await supabase
          .from('game_states')
          .insert({
            room_id: roomId,
            phase: 'playing',
            state_data: { round: 1 }
          })

        if (stateError) throw stateError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Unknown action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})