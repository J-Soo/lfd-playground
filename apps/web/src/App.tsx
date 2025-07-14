import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/index'
import LobbyPage from './pages/lobby'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
      </Routes>
    </Router>
  )
}

export default App