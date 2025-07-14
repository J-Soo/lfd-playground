export default function Voting() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Voting Phase</h2>
      <div className="space-y-4">
        <p className="text-gray-600">Select the player you think is the liar</p>
        {/* Player voting options will be rendered here */}
      </div>
    </div>
  )
}