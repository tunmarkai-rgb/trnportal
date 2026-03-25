import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function VideoLibrary() {
  const [videos, setVideos] = useState([])
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    supabase
      .from('videos')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setFetchError(error.message); setLoading(false); return }
        if (data) setVideos(data)
        setLoading(false)
      })
  }, [])

  const categories = ['All', ...new Set(videos.map(v => v.category).filter(Boolean).sort())]

  const filtered = category === 'All' ? videos : videos.filter(v => v.category === category)

  const pill = (active) => ({
    background: active ? 'var(--gold)' : 'var(--bg-card)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '0.3rem 0.9rem', borderRadius: '999px',
    fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400,
  })

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Video Library</span>
      </nav>

      {/* Video Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '800px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>{selected.title}</p>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', width: '2rem', height: '2rem',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >×</button>
            </div>
            <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <iframe
                src={selected.embed_url}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {selected.host && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Host: <span style={{ color: 'var(--text-secondary)' }}>{selected.host}</span></p>
              )}
              {selected.duration && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{selected.duration}</p>
              )}
              {selected.date && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(selected.date)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        <p className="section-label">Category</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={pill(category === c)}>{c}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading videos…</p>
        ) : fetchError ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ color: '#e05a5a', fontSize: '0.875rem' }}>{fetchError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No videos found.</p>
          </div>
        ) : (
          <div className="nav-grid">
            {filtered.map(v => (
              <div
                key={v.id}
                className="card"
                onClick={() => setSelected(v)}
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                {/* Thumbnail placeholder */}
                <div style={{
                  background: 'var(--gold-dim)',
                  height: '7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '2rem' }}>▶</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.3rem', lineHeight: 1.4 }}>
                    {v.title}
                  </p>
                  {v.host && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                      {v.host}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {v.category && (
                      <span style={{
                        background: 'var(--gold-dim)', color: 'var(--gold)',
                        fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                        borderRadius: '999px', letterSpacing: '0.04em',
                      }}>{v.category}</span>
                    )}
                    {v.duration && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{v.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
