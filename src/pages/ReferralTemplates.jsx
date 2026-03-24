import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ReferralTemplates() {
  const [templates, setTemplates] = useState([])
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('referral_templates')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setTemplates(data)
        setLoading(false)
      })
  }, [])

  const types = ['All', ...new Set(templates.map(t => t.type).filter(Boolean).sort())]

  const filtered = typeFilter === 'All' ? templates : templates.filter(t => t.type === typeFilter)

  const pill = (active) => ({
    background: active ? 'var(--gold)' : 'var(--bg-card)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '0.3rem 0.9rem', borderRadius: '999px',
    fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Referral Templates</span>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {types.length > 1 && (
          <>
            <p className="section-label">Filter by Type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={pill(typeFilter === t)}>{t}</button>
              ))}
            </div>
          </>
        )}

        <p className="section-label">Documents</p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading templates…</p>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No templates found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map((t, i) => (
              <div key={i} className="card" style={{
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📄</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                      {t.name}
                    </p>
                    {t.type && (
                      <span style={{
                        background: 'var(--gold-dim)', color: 'var(--gold)',
                        fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                        borderRadius: '999px', letterSpacing: '0.04em',
                      }}>{t.type}</span>
                    )}
                  </div>
                </div>
                {t.download_link && (
                  <a
                    href={t.download_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--gold)', color: 'var(--bg-primary)',
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '0.4rem 1rem', borderRadius: '0.4rem',
                      border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Download
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
