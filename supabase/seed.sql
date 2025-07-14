-- Insert sample games
INSERT INTO games (name, type, description, min_players, max_players) VALUES
  ('Liar Game', 'liar-game', 'A social deduction game where players try to find the liar', 3, 8),
  ('Word Chain', 'word-chain', 'Players take turns saying words that start with the last letter of the previous word', 2, 6),
  ('Drawing Game', 'drawing-game', 'Players draw and guess each others drawings', 3, 8)
ON CONFLICT DO NOTHING;