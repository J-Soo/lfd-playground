import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useRealtimeGame } from '../hooks/useRealtimeGame'
import { PlayerList } from '@lfd-playground/ui-kit'
import { generateId } from '@lfd-playground/shared-utils'

interface GameRoomProps {
  roomCode: string
}

export default function GameRoom({ roomCode }: GameRoomProps) {
  const [playerId] = useState(() => generateId())
  const { 
    players, 
    gameState,
    connectionStatus,
    isHost,
    setRoomCode,
    setPlayerId,
    setIsHost
  } = useGameStore()
  
  const { sendGameAction } = useRealtimeGame(roomCode, playerId)

  useEffect(() => {
    setRoomCode(roomCode)
    setPlayerId(playerId)
    // First player becomes host
    setIsHost(players.length === 0)
  }, [roomCode, playerId, players.length, setRoomCode, setPlayerId, setIsHost])

  const handleStartGame = () => {
    if (!isHost) return
    sendGameAction({ type: 'START_GAME' })
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">연결 중...</p>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">연결 오류</p>
          <p>다시 시도해주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">라이어 게임</h2>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded">
            방 코드: <span className="font-mono font-bold">{roomCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {gameState.phase === 'waiting' && (
              <WaitingRoom 
                isHost={isHost}
                playerCount={players.length}
                onStartGame={handleStartGame}
              />
            )}
            {gameState.phase === 'category-reveal' && (
              <CategoryReveal 
                category={gameState.category}
                isLiar={players.find(p => p.id === playerId)?.isLiar || false}
                keyword={gameState.keyword}
              />
            )}
            {gameState.phase === 'playing' && (
              <PlayingPhase 
                onSubmitAnswer={(answer) => sendGameAction({ 
                  type: 'SUBMIT_ANSWER', 
                  playerId, 
                  answer 
                })}
              />
            )}
            {gameState.phase === 'voting' && (
              <VotingPhase 
                players={players}
                onVote={(targetId) => sendGameAction({ 
                  type: 'SUBMIT_VOTE', 
                  playerId, 
                  votedFor: targetId 
                })}
              />
            )}
            {gameState.phase === 'reveal' && (
              <RevealPhase 
                players={players}
                liarId={gameState.liarId}
                keyword={gameState.keyword}
              />
            )}
          </div>

          <div>
            <PlayerList 
              players={players.map(p => ({
                id: p.id,
                name: p.name,
                isHost: p.isHost,
                isReady: true,
                score: p.score
              }))}
              currentPlayerId={playerId}
              showScore={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function WaitingRoom({ isHost, playerCount, onStartGame }: {
  isHost: boolean
  playerCount: number
  onStartGame: () => void
}) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-4">대기실</h3>
      <p className="text-gray-600 mb-8">
        {playerCount < 3 
          ? `최소 3명이 필요합니다 (현재 ${playerCount}명)`
          : '모든 플레이어가 준비되면 시작할 수 있습니다'}
      </p>
      {isHost && (
        <button
          onClick={onStartGame}
          disabled={playerCount < 3}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          게임 시작
        </button>
      )}
    </div>
  )
}

function CategoryReveal({ category, isLiar, keyword }: {
  category: string
  isLiar: boolean
  keyword: string
}) {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold mb-4">카테고리: {category}</h3>
      {isLiar ? (
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6">
          <p className="text-xl font-semibold text-red-700">당신은 라이어입니다!</p>
          <p className="text-gray-700 mt-2">다른 사람들의 대화를 잘 듣고 주제를 추측하세요</p>
        </div>
      ) : (
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <p className="text-xl font-semibold text-blue-700">주제어: {keyword}</p>
          <p className="text-gray-700 mt-2">라이어를 찾아내세요!</p>
        </div>
      )}
    </div>
  )
}

function PlayingPhase({ onSubmitAnswer }: {
  onSubmitAnswer: (answer: string) => void
}) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmitAnswer(answer)
      setSubmitted(true)
    }
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-6 text-center">주제에 대해 설명하세요</h3>
      {!submitted ? (
        <div className="max-w-md mx-auto">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="주제에 대한 설명을 입력하세요..."
            className="w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            제출하기
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-green-700">제출 완료!</p>
            <p className="text-gray-600 mt-2">다른 플레이어를 기다리는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function VotingPhase({ players, onVote }: {
  players: any[]
  onVote: (targetId: string) => void
}) {
  const [voted, setVoted] = useState(false)

  const handleVote = (targetId: string) => {
    onVote(targetId)
    setVoted(true)
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-6 text-center">라이어를 찾아 투표하세요</h3>
      {!voted ? (
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => handleVote(player.id)}
              className="p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
            >
              <p className="font-semibold">{player.name}</p>
              {player.answer && (
                <p className="text-sm text-gray-600 mt-2">"{player.answer}"</p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-green-700">투표 완료!</p>
            <p className="text-gray-600 mt-2">결과를 기다리는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function RevealPhase({ players, liarId, keyword }: {
  players: any[]
  liarId: string
  keyword: string
}) {
  const liar = players.find(p => p.id === liarId)
  
  // Calculate vote results
  const voteCount: Record<string, number> = {}
  players.forEach(player => {
    if (player.votedFor) {
      voteCount[player.votedFor] = (voteCount[player.votedFor] || 0) + 1
    }
  })
  
  const mostVoted = Object.entries(voteCount).reduce((a, b) => 
    voteCount[a[0]] > voteCount[b[0]] ? a : b
  )[0]

  const liarCaught = mostVoted === liarId

  return (
    <div className="py-8 text-center">
      <h3 className="text-2xl font-bold mb-6">결과 발표</h3>
      
      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 mb-6">
        <p className="text-xl">라이어는 <span className="font-bold">{liar?.name}</span>님이었습니다!</p>
        <p className="text-lg mt-2">정답: {keyword}</p>
      </div>

      <div className={`rounded-lg p-6 ${liarCaught ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border-2`}>
        <p className="text-xl font-semibold">
          {liarCaught ? '🎉 라이어를 찾았습니다!' : '😈 라이어가 승리했습니다!'}
        </p>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-3">투표 결과</h4>
        <div className="space-y-2 max-w-md mx-auto">
          {Object.entries(voteCount).map(([playerId, count]) => {
            const player = players.find(p => p.id === playerId)
            return (
              <div key={playerId} className="flex justify-between bg-gray-100 p-2 rounded">
                <span>{player?.name}</span>
                <span className="font-semibold">{count}표</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}