import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@lfd-playground/supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { generateId, generateRoomCode } from '@lfd-playground/shared-utils'

// 간단한 타입 정의
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
}

const CATEGORIES = {
  '음식': ['피자', '치킨', '떡볶이', '김치찌개', '짜장면', '삼겹살', '김밥', '라면'],
  '동물': ['강아지', '고양이', '토끼', '사자', '호랑이', '코끼리', '펭귄', '돌고래'],
  '장소': ['학교', '병원', '공원', '영화관', '카페', '도서관', '마트', '해변'],
  '스포츠': ['축구', '농구', '야구', '테니스', '수영', '볼링', '탁구', '배드민턴']
}

export default function App() {
  // 기본 상태
  const [screen, setScreen] = useState<'home' | 'game'>('home')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [playerId] = useState(() => generateId())
  
  // 게임 상태
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameState, setGameState] = useState<GameState>({ phase: 'lobby' })
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)

  const supabase = createSupabaseClient()

  // 방 만들기
  const createRoom = () => {
    const newCode = generateRoomCode()
    setRoomCode(newCode)
    joinRoom(newCode, true)
  }

  // 방 참가
  const joinRoom = (code: string, isHost = false) => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!')
      return
    }

    const newChannel = supabase.channel(`liar-game:${code}`)
    
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost
    }

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState()
        const allPlayers: Player[] = []
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach(presence => {
            allPlayers.push(presence.player)
          })
        })
        
        setPlayers(allPlayers)
      })
      .on('broadcast', { event: 'game_update' }, ({ payload }) => {
        if (payload.type === 'state_change') {
          setGameState(payload.state)
        } else if (payload.type === 'player_update') {
          setPlayers(payload.players)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({ player })
          setMyPlayer(player)
          setChannel(newChannel)
          setScreen('game')
        }
      })
  }

  // 게임 시작 (호스트만)
  const startGame = () => {
    if (!channel || !myPlayer?.isHost) return

    // 랜덤 카테고리와 키워드 선택
    const categories = Object.keys(CATEGORIES)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const keywords = CATEGORIES[category as keyof typeof CATEGORIES]
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    // 랜덤 라이어 선택
    const liarIndex = Math.floor(Math.random() * players.length)
    const liarId = players[liarIndex].id

    // 플레이어 정보 업데이트
    const updatedPlayers = players.map(p => ({
      ...p,
      isLiar: p.id === liarId,
      answer: undefined,
      vote: undefined
    }))

    channel.send({
      type: 'broadcast',
      event: 'game_update',
      payload: {
        type: 'state_change',
        state: { phase: 'playing', category, keyword, liarId }
      }
    })

    channel.send({
      type: 'broadcast',
      event: 'game_update',
      payload: {
        type: 'player_update',
        players: updatedPlayers
      }
    })
  }

  // 답변 제출
  const submitAnswer = (answer: string) => {
    if (!channel || !myPlayer) return

    const updatedPlayers = players.map(p => 
      p.id === myPlayer.id ? { ...p, answer } : p
    )

    channel.send({
      type: 'broadcast',
      event: 'game_update',
      payload: {
        type: 'player_update',
        players: updatedPlayers
      }
    })

    // 모두 답변했는지 확인
    const allAnswered = updatedPlayers.every(p => p.answer)
    if (allAnswered && myPlayer.isHost) {
      channel.send({
        type: 'broadcast',
        event: 'game_update',
        payload: {
          type: 'state_change',
          state: { ...gameState, phase: 'voting' }
        }
      })
    }
  }

  // 투표
  const submitVote = (targetId: string) => {
    if (!channel || !myPlayer) return

    const updatedPlayers = players.map(p => 
      p.id === myPlayer.id ? { ...p, vote: targetId } : p
    )

    channel.send({
      type: 'broadcast',
      event: 'game_update',
      payload: {
        type: 'player_update',
        players: updatedPlayers
      }
    })

    // 모두 투표했는지 확인
    const allVoted = updatedPlayers.every(p => p.vote)
    if (allVoted && myPlayer.isHost) {
      channel.send({
        type: 'broadcast',
        event: 'game_update',
        payload: {
          type: 'state_change',
          state: { ...gameState, phase: 'result' }
        }
      })
    }
  }

  // 연결 해제 시 정리
  useEffect(() => {
    return () => {
      channel?.unsubscribe()
    }
  }, [channel])

  // 홈 화면
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">라이어 게임</h1>
          
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />

          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-3 rounded-lg mb-3 hover:bg-blue-600"
          >
            방 만들기
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="방 코드 입력"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => joinRoom(roomCode)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              참가
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 게임 화면
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">라이어 게임</h1>
            <div className="text-sm bg-gray-100 px-3 py-1 rounded">
              방 코드: <span className="font-mono font-bold">{roomCode}</span>
            </div>
          </div>

          {/* 대기실 */}
          {gameState.phase === 'lobby' && (
            <div className="text-center py-8">
              <h2 className="text-xl mb-4">참가자 ({players.length}명)</h2>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {players.map(p => (
                  <div key={p.id} className="bg-gray-100 px-4 py-2 rounded">
                    {p.name} {p.isHost && '👑'}
                  </div>
                ))}
              </div>
              {myPlayer?.isHost && players.length >= 3 && (
                <button
                  onClick={startGame}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                >
                  게임 시작
                </button>
              )}
              {players.length < 3 && (
                <p className="text-gray-500">최소 3명이 필요합니다</p>
              )}
            </div>
          )}

          {/* 게임 진행 */}
          {gameState.phase === 'playing' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-center">
                카테고리: {gameState.category}
              </h2>
              
              {myPlayer && players.find(p => p.id === myPlayer.id)?.isLiar ? (
                <div className="bg-red-100 p-4 rounded-lg mb-4 text-center">
                  <p className="font-bold text-red-700">당신은 라이어입니다!</p>
                  <p className="text-sm">다른 사람들의 대화를 듣고 주제를 추측하세요</p>
                </div>
              ) : (
                <div className="bg-blue-100 p-4 rounded-lg mb-4 text-center">
                  <p className="font-bold text-blue-700">주제: {gameState.keyword}</p>
                  <p className="text-sm">라이어를 찾아내세요!</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {players.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span>{p.name}</span>
                    <span>{p.answer ? '✅ 답변 완료' : '⏳ 대기 중'}</span>
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
              <h2 className="text-xl font-bold mb-4 text-center">라이어를 찾아 투표하세요!</h2>
              
              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-600">"{p.answer}"</p>
                      </div>
                      {!players.find(pl => pl.id === myPlayer?.id)?.vote && (
                        <button
                          onClick={() => submitVote(p.id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          투표
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결과 */}
          {gameState.phase === 'result' && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">게임 결과</h2>
              
              <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                <p className="font-bold">
                  라이어는 {players.find(p => p.id === gameState.liarId)?.name}님이었습니다!
                </p>
                <p className="text-sm mt-2">정답: {gameState.keyword}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">투표 결과</h3>
                {players.map(p => {
                  const votes = players.filter(pl => pl.vote === p.id).length
                  return (
                    <div key={p.id} className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>{p.name}</span>
                      <span>{votes}표</span>
                    </div>
                  )
                })}
              </div>

              {myPlayer?.isHost && (
                <button
                  onClick={startGame}
                  className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  다시 시작
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}