import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerList } from '@lfd-playground/ui-kit'

interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  joinedAt: Date
}

interface Game {
  id: string
  name: string
  path: string
  minPlayers: number
  maxPlayers: number
  description: string
  emoji: string
}

const GAMES: Game[] = [
  {
    id: 'liar-game',
    name: '라이어 게임',
    path: 'http://localhost:3001',
    minPlayers: 3,
    maxPlayers: 10,
    description: '한 명의 라이어를 찾아내는 추리 게임',
    emoji: '🤥'
  },
  // 나중에 추가할 게임들
  {
    id: 'coming-soon-1',
    name: '준비중',
    path: '#',
    minPlayers: 2,
    maxPlayers: 8,
    description: '곧 추가될 예정입니다',
    emoji: '🎮'
  }
]

export default function LobbyPage() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    // 로컬 스토리지에서 정보 가져오기
    const savedNickname = localStorage.getItem('nickname')
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true'
    
    if (!savedNickname) {
      navigate('/')
      return
    }

    setNickname(savedNickname)
    setIsAdmin(savedIsAdmin)

    // 플레이어 추가 (실제로는 실시간 연동)
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: savedNickname,
      isHost: savedIsAdmin,
      isReady: false,
      joinedAt: new Date()
    }

    setPlayers([newPlayer])
  }, [navigate])

  // 게임 시작
  const handleStartGame = () => {
    if (!selectedGame || !isAdmin) return

    // 선택된 게임으로 리다이렉트
    if (selectedGame.path.startsWith('http')) {
      // 외부 앱인 경우
      window.location.href = selectedGame.path
    } else {
      // 내부 라우트인 경우
      navigate(selectedGame.path)
    }
  }

  // 랜덤 게임 선택
  const handleRandomGame = () => {
    const availableGames = GAMES.filter(g => g.id !== 'coming-soon-1')
    const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)]
    setSelectedGame(randomGame)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">엘프's 플레이그라운드 - 로비</h1>
              <p className="text-gray-600">게임을 선택하고 시작하세요!</p>
            </div>
            <button
              onClick={() => {
                localStorage.clear()
                navigate('/')
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 게임 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">게임 선택</h2>
                {isAdmin && (
                  <button
                    onClick={handleRandomGame}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  >
                    🎲 랜덤 선택
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GAMES.map(game => (
                  <div
                    key={game.id}
                    onClick={() => isAdmin && game.id !== 'coming-soon-1' && setSelectedGame(game)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedGame?.id === game.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      isAdmin && game.id !== 'coming-soon-1' 
                        ? 'cursor-pointer' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{game.emoji}</span>
                      <h3 className="text-lg font-semibold">{game.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                    <p className="text-xs text-gray-500">
                      {game.minPlayers}-{game.maxPlayers}명
                    </p>
                  </div>
                ))}
              </div>

              {/* 게임 시작 버튼 */}
              {isAdmin && selectedGame && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleStartGame}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 text-lg font-medium"
                  >
                    {selectedGame.name} 시작하기
                  </button>
                </div>
              )}

              {!isAdmin && (
                <div className="mt-6 text-center text-gray-500">
                  방장이 게임을 선택하기를 기다리는 중...
                </div>
              )}
            </div>
          </div>

          {/* 플레이어 목록 */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                참가자 ({players.length}명)
              </h2>
              
              <PlayerList 
                players={players}
                currentPlayerId={players[0]?.id}
                showReadyStatus={false}
              />

              {isAdmin && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <span>👑</span>
                    <span>당신은 방장입니다</span>
                  </p>
                </div>
              )}
            </div>

            {/* 채팅 (나중에 구현) */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">채팅</h3>
              <div className="h-48 bg-gray-50 rounded p-3 mb-3">
                <p className="text-gray-400 text-sm">채팅 기능은 준비중입니다...</p>
              </div>
              <input
                type="text"
                placeholder="메시지 입력..."
                className="w-full px-3 py-2 border rounded"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}