export default function Room() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Game Room</h2>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Room Settings</h3>
          <p className="text-gray-600">Configure your game settings here</p>
        </div>
        
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Players</h3>
          <p className="text-gray-600">Waiting for players to join...</p>
        </div>
        
        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Start Game
        </button>
      </div>
    </div>
  )
}