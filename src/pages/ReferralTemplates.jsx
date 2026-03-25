import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'

const ADMIN_EMAIL = 'jake@therealty-network.com'
const EMPTY_FORM = { name: '', type: '', version: '', download_link: '' }

const inputStyle = {
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', borderRadius: '0.4rem',
  padding: '0.6rem 0.75rem', fontSize: '0.825rem',
  fontFamily: 'var(--font-body)', outline: 'none', width: '100%',
}

const iconBtn = {
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  color: 'var(--text-muted)', width: '1.75rem', height: '1.75rem',
  borderRadius: '0.35rem', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
}

const MODAL_FIELDS = [
  { key: 'name',          label: 'Name',          placeholder: 'Template name' },
  { key: 'type',          label: 'Type',          placeholder: 'e.g. Agreement, NDA' },
  { key: 'version',       label: 'Version',       placeholder: 'e.g. v1.0' },
  { key: 'download_link', label: 'Download Link', placeholder: 'https://…' },
]

export default function ReferralTemplates() {
  const [templates, setTemplates] = useState([])
  const [typeFilter, setTypeFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
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
    loadTemplates()
  }, [])

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('referral_templates')
      .select('*')
      .order('name')
    if (error) { setFetchError(error.message); setLoading(false); return }
    if (data) setTemplates(data)
    setLoading(false)
  }

  function openAdd() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setSaveError('')
    setShowModal(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setForm({
      name:          item.name          || '',
      type:          item.type          || '',
      version:       item.version       || '',
      download_link: item.download_link || '',
    })
    setSaveError('')
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    if (editingItem) {
      const { error } = await supabase.from('referral_templates').update(form).eq('id', editingItem.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('referral_templates').insert([form])
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    setShowModal(false)
    setSaving(false)
    setLoading(true)
    loadTemplates()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this template?')) return
    setDeletingId(id)
    await supabase.from('referral_templates').delete().eq('id', id)
    setDeletingId(null)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

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
              + Add Template
            </button>
          )}
        </div>
      </nav>

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
                {editingItem ? 'Edit Template' : 'Add Template'}
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
              {MODAL_FIELDS.map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder || ''}
                    value={form[f.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={inputStyle}
                  />
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
        ) : fetchError ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ color: '#e05a5a', fontSize: '0.875rem' }}>{fetchError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No templates found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(t => (
              <div key={t.id} className="card" style={{
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📄</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                      {t.name}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {t.type && (
                        <span style={{
                          background: 'var(--gold-dim)', color: 'var(--gold)',
                          fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                          borderRadius: '999px', letterSpacing: '0.04em',
                        }}>{t.type}</span>
                      )}
                      {t.version && (
                        <span style={{
                          background: 'var(--bg-primary)', color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          fontSize: '0.6rem', padding: '0.1rem 0.5rem',
                          borderRadius: '999px', letterSpacing: '0.04em',
                        }}>{t.version}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(t)} style={iconBtn} title="Edit">✏</button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        style={{ ...iconBtn, color: '#e05a5a' }}
                        title="Delete"
                      >
                        {deletingId === t.id ? '…' : '🗑'}
                      </button>
                    </>
                  )}
                  {t.download_link && (
                    <a
                      href={t.download_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'var(--gold)', color: 'var(--bg-primary)',
                        fontSize: '0.72rem', fontWeight: 700,
                        padding: '0.4rem 1rem', borderRadius: '0.4rem',
                        whiteSpace: 'nowrap', letterSpacing: '0.04em',
                      }}
                    >
                      Download
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
