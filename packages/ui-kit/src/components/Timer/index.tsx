import { useEffect, useState } from 'react'

export interface TimerProps {
  duration: number // in seconds
  onTimeUp?: () => void
  isPaused?: boolean
  showProgressBar?: boolean
}

export function Timer({ duration, onTimeUp, isPaused = false, showProgressBar = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, isPaused, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = duration > 0 ? (timeLeft / duration) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-center">
        <div className="text-3xl font-bold font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {showProgressBar && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                progress > 20 ? 'bg-blue-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Timer