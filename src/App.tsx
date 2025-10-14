import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CandidateDetail from './pages/CandidateDetail'
import Analytics from './pages/Analytics'
import Demographics from './pages/Demographics'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/demographics" element={<Demographics />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
      </Routes>
    </Router>
  )
}

export default App
