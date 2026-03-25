import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MemberDirectory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')
  const [niche, setNiche] = useState('All')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    supabase
      .from('members')
      .select('id, full_name, country, city, role, niche, status')
      .eq('status', 'approved')
      .order('full_name')
      .then(({ data, error }) => {
        if (error) { setFetchError(error.message); setLoading(false); return }
        if (data) setMembers(data)
        setLoading(false)
      })
  }, [])

  const countries = ['All', ...new Set(members.map(m => m.country).filter(Boolean).sort())]
  const niches = ['All', ...new Set(members.flatMap(m => m.niche || []).filter(Boolean).sort())]

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      m.full_name?.toLowerCase().includes(q) ||
      m.country?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    const matchCountry = country === 'All' || m.country === country
    const matchNiche = niche === 'All' || (m.niche || []).includes(niche)
    return matchSearch && matchCountry && matchNiche
  })

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
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Member Directory</span>
        {!loading && (
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        <input
          type="text"
          placeholder="Search by name, country or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', borderRadius: '0.6rem',
            padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1.5rem',
            fontFamily: 'var(--font-body)', outline: 'none',
          }}
        />

        <p className="section-label">Country</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {countries.map(c => (
            <button key={c} onClick={() => setCountry(c)} style={pill(country === c)}>{c}</button>
          ))}
        </div>

        {niches.length > 1 && (
          <>
            <p className="section-label">Niche</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {niches.map(n => (
                <button key={n} onClick={() => setNiche(n)} style={pill(niche === n)}>{n}</button>
              ))}
            </div>
          </>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading members…</p>
        ) : fetchError ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ color: '#e05a5a', fontSize: '0.875rem' }}>{fetchError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No members found.</p>
          </div>
        ) : (
          <div className="nav-grid">
            {filtered.map(m => (
              <div key={m.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'var(--gold-dim)', border: '1px solid var(--border-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem', color: 'var(--gold)',
                  fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                }}>
                  {m.full_name?.charAt(0)}
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                  {m.full_name}
                </p>
                <p style={{ color: 'var(--gold)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{m.role}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                  {[m.city, m.country].filter(Boolean).join(', ')}
                </p>
                {m.niche?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {m.niche.map(n => (
                      <span key={n} style={{
                        background: 'var(--gold-dim)', color: 'var(--gold)',
                        fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                        borderRadius: '999px', letterSpacing: '0.04em',
                      }}>{n}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
