import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CandidateDetail from './pages/CandidateDetail'
import Analytics from './pages/Analytics'
import Demographics from './pages/Demographics'
import Insights from './pages/Insights'
import Scoring from './pages/Scoring'
import Calendar from './pages/Calendar'
import ActivityLog from './pages/ActivityLog'
import Questionnaires from './pages/Questionnaires'
import Positions from './pages/Positions'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router basename="/painel">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/demographics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Demographics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Layout>
                  <Insights />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scoring"
            element={
              <ProtectedRoute>
                <Layout>
                  <Scoring />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLog />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/questionnaires"
            element={
              <ProtectedRoute>
                <Layout>
                  <Questionnaires />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/positions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Positions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CandidateDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
