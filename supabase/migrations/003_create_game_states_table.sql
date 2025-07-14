-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  host_id UUID REFERENCES players(id) ON DELETE SET NULL,
  state VARCHAR(20) DEFAULT 'waiting',
  settings JSONB DEFAULT '{}',
  max_players INTEGER DEFAULT 8,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create game_states table
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  current_round INTEGER DEFAULT 1,
  phase VARCHAR(50) NOT NULL,
  state_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create room_players table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_ready BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, player_id)
);

-- Create indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_state ON rooms(state);
CREATE INDEX idx_game_states_room_id ON game_states(room_id);
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_room_players_player_id ON room_players(player_id);

-- Add RLS policies for rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are viewable by everyone" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room hosts can update their rooms" ON rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM players 
      WHERE players.id = rooms.host_id 
      AND players.user_id = auth.uid()
    )
  );

-- Add RLS policies for game_states
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game states are viewable by room players" ON game_states
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_players
      JOIN players ON players.id = room_players.player_id
      WHERE room_players.room_id = game_states.room_id
      AND players.user_id = auth.uid()
    )
  );

-- Add RLS policies for room_players
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room players are viewable by everyone" ON room_players
  FOR SELECT USING (true);

CREATE POLICY "Players can join rooms" ON room_players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = room_players.player_id
      AND players.user_id = auth.uid()
    )
  );

-- Add triggers
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();