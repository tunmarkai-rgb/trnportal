import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { icon: '👥', title: 'Member Directory', desc: 'Find agents worldwide', path: '/directory' },
  { icon: '🎥', title: 'Video Library', desc: 'Recorded sessions', path: '/videos' },
  { icon: '📅', title: 'Upcoming Calls', desc: 'Live sessions & events', path: '/calls' },
  { icon: '📚', title: 'Education Hub', desc: 'Guides & resources', path: '/education' },
  { icon: '📝', title: 'Referral Templates', desc: 'Agreements & contracts', path: '/templates' },
  { icon: '💼', title: 'Deal Flow', desc: 'Track active referrals', path: '/deals' },
  { icon: '📖', title: 'Getting Started', desc: 'Onboarding & orientation', path: '/onboarding' },
]

export default function Dashboard() {
  const [memberName, setMemberName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [calls, setCalls] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email)
        const { data: member } = await supabase
          .from('members')
          .select('full_name')
          .eq('email', user.email)
          .single()
        if (member) setMemberName(member.full_name.split(' ')[0])
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: upcomingCalls } = await supabase
        .from('upcoming_calls')
        .select('event_name, date, time, event_type')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)
      if (upcomingCalls) setCalls(upcomingCalls)
    }

    loadData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Sticky Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <img src="/logo.png" alt="TRN" style={{ height: '1.75rem', width: 'auto' }} />
        <button
          onClick={handleSignOut}
          style={{
            background: 'var(--bg-card)', color: 'var(--gold)', border: '1px solid var(--border)',
            padding: '0.35rem 0.9rem', borderRadius: '0.5rem', fontSize: '0.75rem',
            cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}
        >
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1c1400 0%, var(--bg-card) 65%)',
          border: '1px solid var(--gold-dim)',
          borderRadius: '1rem',
          padding: '2rem 1.75rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'var(--gold)', filter: 'blur(70px)', opacity: 0.08
          }} />
          <p style={{
            color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: '0.6rem'
          }}>
            Welcome back
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
            fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.2
          }}>
            {memberName || 'Member'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Your global real estate headquarters.
          </p>
        </div>

        {/* Admin button — Jake only */}
        {userEmail === 'jake@therealty-network.com' && (
          <Link
            to="/admin"
            style={{
              display: 'block',
              width: '100%',
              background: 'var(--gold)',
              color: 'var(--bg-primary)',
              textAlign: 'center',
              padding: '0.875rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              marginBottom: '2.5rem',
            }}
          >
            Admin Dashboard →
          </Link>
        )}

        {/* Nav Cards */}
        <p className="section-label">Quick Access</p>
        <div className="nav-grid" style={{ marginBottom: '2.5rem' }}>
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="nav-card"
            >
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.75rem' }}>
                {item.icon}
              </span>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                {item.title}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Upcoming Calls */}
        <p className="section-label">Upcoming Calls</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2.5rem' }}>
          {calls.length === 0 ? (
            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming calls scheduled.</p>
            </div>
          ) : calls.map((call, i) => (
            <div key={i} className="card" style={{
              padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'center', minWidth: '2.75rem' }}>
                  <p style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {formatDate(call.date)}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.15rem' }}>
                    {call.time || '—'}
                  </p>
                </div>
                <div style={{ width: '1px', height: '2rem', background: 'var(--border)' }} />
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {call.event_name}
                  </p>
                  <span style={{
                    background: 'var(--gold-dim)', color: 'var(--gold)',
                    fontSize: '0.65rem', padding: '0.15rem 0.6rem',
                    borderRadius: '999px', marginTop: '0.3rem',
                    display: 'inline-block', letterSpacing: '0.04em'
                  }}>
                    {call.event_type}
                  </span>
                </div>
              </div>
              <button style={{
                background: 'var(--gold)', color: 'var(--bg-primary)',
                fontSize: '0.7rem', fontWeight: 700,
                padding: '0.4rem 0.9rem', borderRadius: '0.4rem',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                RSVP
              </button>
            </div>
          ))}
        </div>

        {/* Announcements */}
        <p className="section-label">Announcements</p>
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Welcome to the new TRN Member Portal. Explore the directory, watch recorded sessions, and join the next live call.
          </p>
        </div>

      </div>
    </div>
  )
}
