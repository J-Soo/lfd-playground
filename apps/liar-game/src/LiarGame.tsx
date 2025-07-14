import { useState } from 'react'
import GameRoom from './components/GameRoom'
import JoinRoom from './components/JoinRoom'

export default function LiarGame() {
  const [roomCode, setRoomCode] = useState<string>('')
  const [joined, setJoined] = useState(false)

  const handleJoinRoom = (code: string) => {
    setRoomCode(code)
    setJoined(true)
  }

  if (!joined) {
    return <JoinRoom onJoin={handleJoinRoom} />
  }

  return <GameRoom roomCode={roomCode} />
}