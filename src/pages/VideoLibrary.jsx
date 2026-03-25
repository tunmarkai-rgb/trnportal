import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'

const ADMIN_EMAIL = 'jake@therealty-network.com'
const EMPTY_FORM = { title: '', category: '', host: '', date: '', duration: '', embed_url: '' }

const VIDEO_CATEGORIES = ['Deal Structuring', 'Legal', 'Market Intelligence', 'Referral', 'Mindset', 'Guest Speaker', 'General']

function getEmbedUrl(url) {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const watchMatch = url.match(/[?&]v=([^?&]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  return url
}

function getVideoId(url) {
  const embed = getEmbedUrl(url)
  const match = embed.match(/\/embed\/([^?&/]+)/)
  return match ? match[1] : null
}

const inputStyle = {
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', borderRadius: '0.4rem',
  padding: '0.6rem 0.75rem', fontSize: '0.825rem',
  fontFamily: 'var(--font-body)', outline: 'none', width: '100%',
}

const iconBtn = {
  background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text-primary)', width: '1.75rem', height: '1.75rem',
  borderRadius: '0.35rem', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem',
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState([])
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === ADMIN_EMAIL) setIsAdmin(true)
    }
    init()
    loadVideos()
  }, [])

  async function loadVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('date', { ascending: false })
    if (error) { setFetchError(error.message); setLoading(false); return }
    if (data) setVideos(data)
    setLoading(false)
  }

  function openAdd() {
    setEditingVideo(null)
    setForm(EMPTY_FORM)
    setSaveError('')
    setShowModal(true)
  }

  function openEdit(e, video) {
    e.stopPropagation()
    setEditingVideo(video)
    setForm({
      title: video.title || '',
      category: video.category || '',
      host: video.host || '',
      date: video.date || '',
      duration: video.duration || '',
      embed_url: video.embed_url || '',
    })
    setSaveError('')
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    if (editingVideo) {
      const { error } = await supabase.from('videos').update(form).eq('id', editingVideo.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('videos').insert([form])
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    setShowModal(false)
    setSaving(false)
    setLoading(true)
    loadVideos()
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Delete this video?')) return
    setDeletingId(id)
    await supabase.from('videos').delete().eq('id', id)
    setDeletingId(null)
    setVideos(prev => prev.filter(v => v.id !== id))
  }

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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeToggle />
          {isAdmin && (
            <button
              onClick={openAdd}
              style={{
                background: 'var(--gold)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: '0.4rem',
                padding: '0.4rem 0.9rem', fontSize: '0.75rem',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              + Add Video
            </button>
          )}
        </div>
      </nav>

      {/* Video playback modal */}
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
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '800px' }}>
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
                src={getEmbedUrl(selected.embed_url)}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {selected.host && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Host: <span style={{ color: 'var(--text-secondary)' }}>{selected.host}</span>
                </p>
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

      {/* Add / Edit modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}>
                {editingVideo ? 'Edit Video' : 'Add Video'}
              </p>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', width: '1.75rem', height: '1.75rem',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'title',     label: 'Title',       type: 'text' },
                { key: 'category',  label: 'Category',    type: 'select', options: VIDEO_CATEGORIES },
                { key: 'host',      label: 'Host',        type: 'text' },
                { key: 'date',      label: 'Date',        type: 'date' },
                { key: 'duration',  label: 'Duration',    type: 'text', placeholder: 'e.g. 45 min' },
                { key: 'embed_url', label: 'YouTube URL', type: 'text', placeholder: 'youtu.be/... or youtube.com/watch?v=...' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">— select —</option>
                      {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder || ''}
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
            {saveError && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#e05a5a10', border: '1px solid #e05a5a40', borderRadius: '0.4rem' }}>
                <p style={{ color: '#e05a5a', fontSize: '0.8rem' }}>{saveError}</p>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', marginTop: '1.25rem',
                background: saving ? 'var(--gold-dim)' : 'var(--gold)',
                color: 'var(--bg-primary)', border: 'none',
                borderRadius: '0.5rem', padding: '0.75rem',
                fontSize: '0.875rem', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
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
            {filtered.map(v => {
              const videoId = getVideoId(v.embed_url)
              return (
                <div
                  key={v.id}
                  className="card"
                  onClick={() => v.embed_url && setSelected(v)}
                  style={{ cursor: 'pointer', overflow: 'hidden' }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    height: '7rem', position: 'relative',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--gold-dim)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {videoId ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={v.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(0,0,0,0.22)',
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>▶</span>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No video available</p>
                    )}
                    {isAdmin && (
                      <div
                        style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', display: 'flex', gap: '0.3rem' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button onClick={e => openEdit(e, v)} style={iconBtn} title="Edit">✏</button>
                        <button
                          onClick={e => handleDelete(e, v.id)}
                          disabled={deletingId === v.id}
                          style={{ ...iconBtn, color: '#e05a5a' }}
                          title="Delete"
                        >
                          {deletingId === v.id ? '…' : '🗑'}
                        </button>
                      </div>
                    )}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
