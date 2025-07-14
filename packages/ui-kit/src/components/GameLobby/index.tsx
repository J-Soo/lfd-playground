
export interface GameLobbyProps {
  roomCode: string
  playerCount: number
  maxPlayers: number
  isHost: boolean
  onStartGame: () => void
  onLeaveRoom: () => void
}

export function GameLobby({ 
  roomCode, 
  playerCount, 
  maxPlayers, 
  isHost, 
  onStartGame, 
  onLeaveRoom 
}: GameLobbyProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Game Lobby</h2>
        <div className="text-sm bg-gray-100 px-3 py-1 rounded">
          Room Code: <span className="font-mono font-bold">{roomCode}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Players</span>
          <span>{playerCount}/{maxPlayers}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(playerCount / maxPlayers) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        {isHost && (
          <button
            onClick={onStartGame}
            disabled={playerCount < 2}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
        )}
        <button
          onClick={onLeaveRoom}
          className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Leave Room
        </button>
      </div>
    </div>
  )
}

export default GameLobby