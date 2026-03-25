import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MemberDirectory from './pages/MemberDirectory'
import VideoLibrary from './pages/VideoLibrary'
import UpcomingCalls from './pages/UpcomingCalls'
import EducationHub from './pages/EducationHub'
import ReferralTemplates from './pages/ReferralTemplates'
import DealFlow from './pages/DealFlow'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}>Loading…</p>
    </div>
  )

  const auth = (el) => session ? el : <Navigate to="/login" />
  const adminOnly = session?.user?.email === 'jake@therealty-network.com'
    ? <Admin />
    : session
      ? <Navigate to="/dashboard" />
      : <Navigate to="/login" />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"      element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard"  element={auth(<Dashboard />)} />
        <Route path="/directory"  element={auth(<MemberDirectory />)} />
        <Route path="/videos"     element={auth(<VideoLibrary />)} />
        <Route path="/calls"      element={auth(<UpcomingCalls />)} />
        <Route path="/education"  element={auth(<EducationHub />)} />
        <Route path="/templates"  element={auth(<ReferralTemplates />)} />
        <Route path="/deals"      element={auth(<DealFlow />)} />
        <Route path="/onboarding" element={auth(<Onboarding />)} />
        <Route path="/profile"    element={auth(<Profile />)} />
        <Route path="/admin"      element={adminOnly} />
        <Route path="*"           element={<Navigate to={session ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
