-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  total_games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_name ON players(name);

-- Add RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Users can view all players
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

-- Users can only insert their own player record
CREATE POLICY "Users can insert their own player" ON players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own player record
CREATE POLICY "Users can update their own player" ON players
  FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();