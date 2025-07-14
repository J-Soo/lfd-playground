import { useState } from 'react'
import { generateId, generateRoomCode } from '@lfd-playground/shared-utils'

interface Player {
  id: string
  name: string
  isHost: boolean
  isLiar?: boolean
  answer?: string
  vote?: string
}

interface GameState {
  phase: 'lobby' | 'playing' | 'voting' | 'result'
  category?: string
  keyword?: string
  liarId?: string
  currentRound: number
  totalRounds: number
}

const CATEGORIES = {
  '음식': ['피자', '치킨', '떡볶이', '김치찌개', '짜장면', '삼겹살', '김밥', '라면', '김치볶음밥', '된장찌개'],
  '동물': ['강아지', '고양이', '토끼', '사자', '호랑이', '코끼리', '펭귄', '돌고래', '원숭이', '기린'],
  '장소': ['학교', '병원', '공원', '영화관', '카페', '도서관', '마트', '해변', '놀이동산', '산'],
  '스포츠': ['축구', '농구', '야구', '테니스', '수영', '볼링', '탁구', '배드민턴', '스키', '골프']
}

// 로컬 테스트용 앱
export default function AppLocal() {
  const [screen, setScreen] = useState<'home' | 'game'>('home')
  const [roomCode] = useState(generateRoomCode())
  const [playerName, setPlayerName] = useState('')
  const [playerId] = useState(generateId())
  
  const [players, setPlayers] = useState<Player[]>([])
  const [gameState, setGameState] = useState<GameState>({ 
    phase: 'lobby',
    currentRound: 1,
    totalRounds: 5
  })
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)

  // 게임 참가
  const joinGame = () => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!')
      return
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      isHost: players.length === 0
    }

    setPlayers([...players, newPlayer])
    setMyPlayer(newPlayer)
    setScreen('game')
  }

  // 게임 시작
  const startGame = () => {
    if (players.length < 3) {
      alert('최소 3명이 필요합니다!')
      return
    }

    const categories = Object.keys(CATEGORIES)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const keywords = CATEGORIES[category as keyof typeof CATEGORIES]
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    const liarIndex = Math.floor(Math.random() * players.length)
    const liarId = players[liarIndex].id

    setPlayers(players.map(p => ({
      ...p,
      isLiar: p.id === liarId,
      answer: undefined,
      vote: undefined
    })))

    setGameState({
      ...gameState,
      phase: 'playing',
      category,
      keyword,
      liarId
    })
  }

  // 답변 제출
  const submitAnswer = (answer: string) => {
    if (!myPlayer) return

    setPlayers(players.map(p => 
      p.id === myPlayer.id ? { ...p, answer } : p
    ))

    const updatedPlayers = players.map(p => 
      p.id === myPlayer.id ? { ...p, answer } : p
    )
    
    const allAnswered = updatedPlayers.every(p => p.answer)
    if (allAnswered) {
      setGameState({ ...gameState, phase: 'voting' })
    }
  }

  // 투표
  const submitVote = (targetId: string) => {
    if (!myPlayer) return

    setPlayers(players.map(p => 
      p.id === myPlayer.id ? { ...p, vote: targetId } : p
    ))

    const updatedPlayers = players.map(p => 
      p.id === myPlayer.id ? { ...p, vote: targetId } : p
    )
    
    const allVoted = updatedPlayers.every(p => p.vote)
    if (allVoted) {
      setGameState({ ...gameState, phase: 'result' })
    }
  }

  // 다음 라운드
  const nextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      alert('게임이 끝났습니다!')
      return
    }

    const categories = Object.keys(CATEGORIES)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const keywords = CATEGORIES[category as keyof typeof CATEGORIES]
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    const liarIndex = Math.floor(Math.random() * players.length)
    const liarId = players[liarIndex].id

    setPlayers(players.map(p => ({
      ...p,
      isLiar: p.id === liarId,
      answer: undefined,
      vote: undefined
    })))

    setGameState({
      ...gameState,
      phase: 'playing',
      category,
      keyword,
      liarId,
      currentRound: gameState.currentRound + 1
    })
  }

  // 홈 화면
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">라이어 게임</h1>
          <p className="text-center text-gray-500 mb-4">로컬 테스트 버전</p>
          
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && joinGame()}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />

          <button
            onClick={joinGame}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
          >
            게임 참가
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            방 코드: {roomCode}
          </div>
        </div>
      </div>
    )
  }

  // 게임 화면
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">라이어 게임</h1>
            <div className="text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded mr-2">
                방 코드: {roomCode}
              </span>
              <span className="bg-blue-100 px-3 py-1 rounded">
                라운드 {gameState.currentRound}/{gameState.totalRounds}
              </span>
            </div>
          </div>

          {/* 대기실 */}
          {gameState.phase === 'lobby' && (
            <div className="text-center py-8">
              <h2 className="text-xl mb-4">참가자 목록</h2>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-6">
                {players.map(p => (
                  <div key={p.id} className={`bg-gray-100 px-4 py-2 rounded ${p.id === myPlayer?.id ? 'ring-2 ring-blue-500' : ''}`}>
                    {p.name} {p.isHost && '👑'}
                  </div>
                ))}
              </div>
              
              {myPlayer?.isHost ? (
                <button
                  onClick={startGame}
                  disabled={players.length < 3}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                >
                  게임 시작 ({players.length}/3명 이상)
                </button>
              ) : (
                <p className="text-gray-500">호스트가 게임을 시작하기를 기다리는 중...</p>
              )}
            </div>
          )}

          {/* 게임 진행 */}
          {gameState.phase === 'playing' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">
                카테고리: {gameState.category}
              </h2>
              
              <div className={`p-6 rounded-lg mb-6 text-center ${
                players.find(p => p.id === myPlayer?.id)?.isLiar 
                  ? 'bg-red-100 border-2 border-red-300' 
                  : 'bg-blue-100 border-2 border-blue-300'
              }`}>
                {players.find(p => p.id === myPlayer?.id)?.isLiar ? (
                  <>
                    <p className="font-bold text-red-700 text-xl">당신은 라이어입니다!</p>
                    <p className="text-gray-700 mt-2">다른 사람들의 대화를 듣고 주제를 추측하세요</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-blue-700 text-xl">주제: {gameState.keyword}</p>
                    <p className="text-gray-700 mt-2">라이어를 찾아내세요!</p>
                  </>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {players.map(p => (
                  <div key={p.id} className={`flex justify-between items-center p-3 rounded ${
                    p.answer ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <span className="font-medium">{p.name}</span>
                    <span className={p.answer ? 'text-green-600' : 'text-gray-400'}>
                      {p.answer ? '✅ 답변 완료' : '⏳ 대기 중'}
                    </span>
                  </div>
                ))}
              </div>

              {!players.find(p => p.id === myPlayer?.id)?.answer && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="주제에 대한 설명을 입력하세요"
                    className="flex-1 px-4 py-2 border rounded-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        submitAnswer(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* 투표 */}
          {gameState.phase === 'voting' && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-center">
                라이어를 찾아 투표하세요!
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map(p => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{p.name}</p>
                        <p className="text-gray-600 mt-1">"{p.answer}"</p>
                      </div>
                      {p.id !== myPlayer?.id && !players.find(pl => pl.id === myPlayer?.id)?.vote && (
                        <button
                          onClick={() => submitVote(p.id)}
                          className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          투표
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {players.find(p => p.id === myPlayer?.id)?.vote && (
                <p className="text-center mt-6 text-gray-500">
                  투표 완료! 다른 플레이어를 기다리는 중...
                </p>
              )}
            </div>
          )}

          {/* 결과 */}
          {gameState.phase === 'result' && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-6">라운드 {gameState.currentRound} 결과</h2>
              
              <div className="bg-yellow-100 p-6 rounded-lg mb-6">
                <p className="text-xl font-bold mb-2">
                  라이어는 {players.find(p => p.id === gameState.liarId)?.name}님이었습니다!
                </p>
                <p className="text-lg">정답: {gameState.keyword}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">투표 결과</h3>
                <div className="max-w-md mx-auto space-y-2">
                  {players.map(p => {
                    const votes = players.filter(pl => pl.vote === p.id).length
                    return (
                      <div key={p.id} className={`flex justify-between p-3 rounded ${
                        p.id === gameState.liarId ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <span>{p.name}</span>
                        <span className="font-bold">{votes}표</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 라이어를 찾았는지 결과 */}
              <div className={`p-4 rounded-lg mb-6 ${
                players.filter(p => p.vote === gameState.liarId).length > players.length / 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <p className="text-xl font-bold">
                  {players.filter(p => p.vote === gameState.liarId).length > players.length / 2
                    ? '🎉 라이어를 찾았습니다!'
                    : '😈 라이어가 승리했습니다!'}
                </p>
              </div>

              {myPlayer?.isHost && (
                <button
                  onClick={nextRound}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  {gameState.currentRound < gameState.totalRounds ? '다음 라운드' : '게임 종료'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}