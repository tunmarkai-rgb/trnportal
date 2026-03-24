import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EducationHub() {
  const [resources, setResources] = useState([])
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('education_hub')
      .select('*')
      .order('title')
      .then(({ data }) => {
        if (data) setResources(data)
        setLoading(false)
      })
  }, [])

  const types = ['All', ...new Set(resources.map(r => r.type).filter(Boolean).sort())]

  const filtered = typeFilter === 'All' ? resources : resources.filter(r => r.type === typeFilter)

  const pill = (active) => ({
    background: active ? 'var(--gold)' : 'var(--bg-card)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '0.3rem 0.9rem', borderRadius: '999px',
    fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400,
  })

  const typeIcon = (type) => {
    if (!type) return '📄'
    const t = type.toLowerCase()
    if (t.includes('video')) return '🎥'
    if (t.includes('guide') || t.includes('pdf')) return '📋'
    if (t.includes('template')) return '📝'
    if (t.includes('webinar')) return '🎓'
    return '📄'
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Education Hub</span>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        <p className="section-label">Filter by Type</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={pill(typeFilter === t)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading resources…</p>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No resources found.</p>
          </div>
        ) : (
          <div className="nav-grid">
            {filtered.map((r, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{typeIcon(r.type)}</div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                  {r.title}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {r.type && (
                    <span style={{
                      background: 'var(--gold-dim)', color: 'var(--gold)',
                      fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                      borderRadius: '999px', letterSpacing: '0.04em',
                    }}>{r.type}</span>
                  )}
                  {r.category && r.category !== r.type && (
                    <span style={{
                      background: 'var(--bg-primary)', color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                      borderRadius: '999px', letterSpacing: '0.04em',
                    }}>{r.category}</span>
                  )}
                </div>
                {r.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.75rem', flexGrow: 1 }}>
                    {r.description.length > 100 ? r.description.slice(0, 100) + '…' : r.description}
                  </p>
                )}
                {r.file_link && (
                  <a
                    href={r.file_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', marginTop: 'auto',
                      background: 'var(--gold)', color: 'var(--bg-primary)',
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '0.4rem 1rem', borderRadius: '0.4rem',
                      letterSpacing: '0.04em', alignSelf: 'flex-start',
                    }}
                  >
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
