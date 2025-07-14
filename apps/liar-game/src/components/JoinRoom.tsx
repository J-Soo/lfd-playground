import { useState } from 'react'
import { generateRoomCode } from '@lfd-playground/shared-utils'

interface JoinRoomProps {
  onJoin: (roomCode: string) => void
}

export default function JoinRoom({ onJoin }: JoinRoomProps) {
  const [inputCode, setInputCode] = useState('')
  const [mode, setMode] = useState<'join' | 'create'>('join')

  const handleCreateRoom = () => {
    const newCode = generateRoomCode()
    onJoin(newCode)
  }

  const handleJoinRoom = () => {
    if (inputCode.length === 6) {
      onJoin(inputCode.toUpperCase())
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">라이어 게임</h1>

        <div className="flex mb-6">
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-l-lg ${
              mode === 'join' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            방 참가
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-r-lg ${
              mode === 'create' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            방 만들기
          </button>
        </div>

        {mode === 'join' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방 코드 입력
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="6자리 코드"
              className="w-full px-4 py-3 border rounded-lg text-center text-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleJoinRoom}
              disabled={inputCode.length !== 6}
              className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              참가하기
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6 text-center">
              새로운 방을 만들고 친구들을 초대하세요
            </p>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
            >
              방 만들기
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">게임 방법</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 최소 3명이 필요합니다</li>
            <li>• 라이어 1명은 주제어를 모릅니다</li>
            <li>• 대화를 통해 라이어를 찾아내세요</li>
            <li>• 라이어는 주제어를 추측해야 합니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}