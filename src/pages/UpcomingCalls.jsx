import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UpcomingCalls() {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('upcoming_calls')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data) setCalls(data)
        setLoading(false)
      })
  }, [])

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Upcoming Calls</span>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        <p className="section-label">Scheduled Events</p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading calls…</p>
        ) : calls.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming calls scheduled.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {calls.map((call, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem 1.5rem' }}>

                {/* Top row: date + type badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {formatDate(call.date)}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                        {call.time || 'Time TBC'}
                      </p>
                    </div>
                  </div>
                  {call.event_type && (
                    <span style={{
                      background: 'var(--gold-dim)', color: 'var(--gold)',
                      fontSize: '0.65rem', padding: '0.2rem 0.7rem',
                      borderRadius: '999px', letterSpacing: '0.04em', fontWeight: 500,
                    }}>{call.event_type}</span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {call.event_name}
                  </p>
                  {call.host && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                      Hosted by <span style={{ color: 'var(--text-secondary)' }}>{call.host}</span>
                    </p>
                  )}

                  {call.meeting_link && (
                    <a
                      href={call.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        background: 'var(--gold)', color: 'var(--bg-primary)',
                        fontSize: '0.75rem', fontWeight: 700,
                        padding: '0.45rem 1.1rem', borderRadius: '0.4rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      RSVP / JOIN
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
