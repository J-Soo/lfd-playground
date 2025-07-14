export default function Results() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Game Results</h2>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg">The liar was...</p>
          <p className="text-3xl font-bold text-red-500 mt-2">Player Name</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Final Scores</h3>
          {/* Score list will be rendered here */}
        </div>
        
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Play Again
        </button>
      </div>
    </div>
  )
}