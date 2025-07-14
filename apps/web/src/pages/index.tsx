import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [logoClicks, setLogoClicks] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminBadge, setShowAdminBadge] = useState(false)

  // 로고 클릭 핸들러
  const handleLogoClick = () => {
    const newCount = logoClicks + 1
    setLogoClicks(newCount)

    if (newCount === 7) {
      setIsAdmin(true)
      setShowAdminBadge(true)
      // 약간의 피드백
      document.body.style.backgroundColor = '#fef3c7'
      setTimeout(() => {
        document.body.style.backgroundColor = ''
      }, 500)
    }

    // 10초 후 클릭 카운트 리셋
    setTimeout(() => setLogoClicks(0), 10000)
  }

  // 입장 핸들러
  const handleEnter = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요!')
      return
    }

    // 로컬 스토리지에 저장
    localStorage.setItem('nickname', nickname)
    localStorage.setItem('isAdmin', isAdmin.toString())
    
    navigate('/lobby')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer select-none"
            onClick={handleLogoClick}
          >
            엘프's 플레이그라운드
          </h1>
          <p className="text-gray-500 mt-2">MT 게임 파티 🎉</p>
          
          {/* 숨겨진 방장 뱃지 */}
          {showAdminBadge && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
              <span className="text-yellow-800 text-sm font-medium">👑 방장 모드 활성화</span>
            </div>
          )}
        </div>

        {/* 닉네임 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEnter()}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
          </div>

          <button
            onClick={handleEnter}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            입장하기
          </button>
        </div>

        {/* 설명 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🎮 게임 목록</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 라이어 게임</li>
            <li>• 더 많은 게임 준비중...</li>
          </ul>
        </div>

        {/* 크레딧 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Made with ❤️ for MT
        </div>
      </div>
    </div>
  )
}