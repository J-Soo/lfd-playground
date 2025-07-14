
export interface ScoreEntry {
  playerId: string
  playerName: string
  score: number
  rank?: number
  avatarUrl?: string
}

export interface ScoreBoardProps {
  scores: ScoreEntry[]
  title?: string
  highlightPlayerId?: string
}

export function ScoreBoard({ scores, title = "Scoreboard", highlightPlayerId }: ScoreBoardProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {sortedScores.map((entry, index) => (
          <div 
            key={entry.playerId}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.playerId === highlightPlayerId 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-lg font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-orange-600' :
                'text-gray-600'
              }`}>
                #{index + 1}
              </div>
              {entry.avatarUrl ? (
                <img 
                  src={entry.avatarUrl} 
                  alt={entry.playerName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                  {entry.playerName[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium">{entry.playerName}</span>
            </div>
            <div className="text-lg font-bold">
              {entry.score} <span className="text-sm font-normal text-gray-500">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreBoard