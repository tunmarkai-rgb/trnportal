import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'jake@therealty-network.com'
const EMPTY_FORM = {
  event_name: '', date: '', time: '', host: '',
  event_type: '', meeting_link: '', description: '', open_to: '',
}

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
  { key: 'event_name',   label: 'Event Name',   type: 'text' },
  { key: 'date',         label: 'Date',         type: 'date' },
  { key: 'time',         label: 'Time',         type: 'time' },
  { key: 'host',         label: 'Host',         type: 'text' },
  { key: 'event_type',   label: 'Event Type',   type: 'text', placeholder: 'e.g. Weekly Call, Webinar' },
  { key: 'meeting_link', label: 'Meeting Link', type: 'text' },
  { key: 'description',  label: 'Description',  type: 'textarea' },
  { key: 'open_to',      label: 'Open To',      type: 'text', placeholder: 'e.g. All Members' },
]

export default function UpcomingCalls() {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingCall, setEditingCall] = useState(null)
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
    loadCalls()
  }, [])

  async function loadCalls() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('upcoming_calls')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
    if (error) { setFetchError(error.message); setLoading(false); return }
    if (data) setCalls(data)
    setLoading(false)
  }

  function openAdd() {
    setEditingCall(null)
    setForm(EMPTY_FORM)
    setSaveError('')
    setShowModal(true)
  }

  function openEdit(call) {
    setEditingCall(call)
    setForm({
      event_name:   call.event_name   || '',
      date:         call.date         || '',
      time:         call.time         || '',
      host:         call.host         || '',
      event_type:   call.event_type   || '',
      meeting_link: call.meeting_link || '',
      description:  call.description  || '',
      open_to:      call.open_to      || '',
    })
    setSaveError('')
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    if (editingCall) {
      const { error } = await supabase.from('upcoming_calls').update(form).eq('id', editingCall.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('upcoming_calls').insert([form])
      if (error) { setSaveError(error.message); setSaving(false); return }
    }
    setShowModal(false)
    setSaving(false)
    setLoading(true)
    loadCalls()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this call?')) return
    setDeletingId(id)
    await supabase.from('upcoming_calls').delete().eq('id', id)
    setDeletingId(null)
    setCalls(prev => prev.filter(c => c.id !== id))
  }

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
        {isAdmin && (
          <button
            onClick={openAdd}
            style={{
              marginLeft: 'auto',
              background: 'var(--gold)', color: 'var(--bg-primary)',
              border: 'none', borderRadius: '0.4rem',
              padding: '0.4rem 0.9rem', fontSize: '0.75rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            + Add Call
          </button>
        )}
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
                {editingCall ? 'Edit Call' : 'Add Call'}
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
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder || ''}
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
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

        <p className="section-label">Scheduled Events</p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading calls…</p>
        ) : fetchError ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ color: '#e05a5a', fontSize: '0.875rem' }}>{fetchError}</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming calls scheduled.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {calls.map(call => (
              <div key={call.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {formatDate(call.date)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                      {call.time || 'Time TBC'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {call.event_type && (
                      <span style={{
                        background: 'var(--gold-dim)', color: 'var(--gold)',
                        fontSize: '0.65rem', padding: '0.2rem 0.7rem',
                        borderRadius: '999px', letterSpacing: '0.04em', fontWeight: 500,
                      }}>{call.event_type}</span>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(call)} style={iconBtn} title="Edit">✏</button>
                        <button
                          onClick={() => handleDelete(call.id)}
                          disabled={deletingId === call.id}
                          style={{ ...iconBtn, color: '#e05a5a' }}
                          title="Delete"
                        >
                          {deletingId === call.id ? '…' : '🗑'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {call.event_name}
                  </p>
                  {call.host && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: call.description ? '0.4rem' : '0.75rem' }}>
                      Hosted by <span style={{ color: 'var(--text-secondary)' }}>{call.host}</span>
                    </p>
                  )}
                  {call.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {call.description}
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
