
export interface Player {
  id: string
  name: string
  avatarUrl?: string
  isHost?: boolean
  isReady?: boolean
  score?: number
}

export interface PlayerListProps {
  players: Player[]
  currentPlayerId?: string
  showScore?: boolean
  showReadyStatus?: boolean
}

export function PlayerList({ 
  players, 
  currentPlayerId, 
  showScore = false, 
  showReadyStatus = false 
}: PlayerListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Players</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-2 rounded ${
              player.id === currentPlayerId ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {player.avatarUrl ? (
                <img 
                  src={player.avatarUrl} 
                  alt={player.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                  {player.name[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium">
                {player.name}
                {player.isHost && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Host
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showScore && (
                <span className="text-sm font-medium">{player.score || 0} pts</span>
              )}
              {showReadyStatus && (
                <span className={`text-xs px-2 py-1 rounded ${
                  player.isReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlayerList