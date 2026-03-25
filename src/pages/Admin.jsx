import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  approved: '#4caf50',
  pending:  '#d7a042',
  rejected: '#e05a5a',
}

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

const DEAL_STAGES = [
  'Lead', 'Prospect', 'Active', 'Negotiating',
  'Under Contract', 'Closed', 'Commission Collected', 'Dead',
]

const CONTENT_CONFIG = {
  videos: {
    table:   'videos',
    label:   'Videos',
    columns: ['title', 'category', 'host', 'date', 'duration'],
    fields:  [
      { key: 'title',     label: 'Title',             type: 'text' },
      { key: 'category',  label: 'Category',          type: 'text' },
      { key: 'host',      label: 'Host',              type: 'text' },
      { key: 'date',      label: 'Date',              type: 'date' },
      { key: 'duration',  label: 'Duration',          type: 'text', placeholder: 'e.g. 45 min' },
      { key: 'embed_url', label: 'YouTube Embed URL', type: 'text' },
    ],
  },
  calls: {
    table:   'upcoming_calls',
    label:   'Upcoming Calls',
    columns: ['event_name', 'date', 'time', 'host', 'event_type'],
    fields:  [
      { key: 'event_name',   label: 'Event Name',   type: 'text' },
      { key: 'date',         label: 'Date',         type: 'date' },
      { key: 'time',         label: 'Time',         type: 'time' },
      { key: 'host',         label: 'Host',         type: 'text' },
      { key: 'event_type',   label: 'Event Type',   type: 'text' },
      { key: 'meeting_link', label: 'Meeting Link', type: 'text' },
    ],
  },
  education: {
    table:   'education_hub',
    label:   'Education Hub',
    columns: ['title', 'type', 'category'],
    fields:  [
      { key: 'title',       label: 'Title',       type: 'text' },
      { key: 'type',        label: 'Type',        type: 'text' },
      { key: 'category',    label: 'Category',    type: 'text' },
      { key: 'file_link',   label: 'File Link',   type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  templates: {
    table:   'referral_templates',
    label:   'Referral Templates',
    columns: ['name', 'type'],
    fields:  [
      { key: 'name',          label: 'Name',          type: 'text' },
      { key: 'type',          label: 'Type',          type: 'text' },
      { key: 'download_link', label: 'Download Link', type: 'text' },
    ],
  },
}

// ── Shared cell styles ─────────────────────────────────────────────────────────

const TH = {
  padding: '0.6rem 1rem',
  color: 'var(--text-muted)', fontSize: '0.65rem',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  fontWeight: 600, textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap', background: 'var(--bg-card)',
}

const TD = {
  padding: '0.75rem 1rem',
  color: 'var(--text-primary)', fontSize: '0.8rem',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
}

const ErrorCard = ({ message }) => (
  <div className="card" style={{ padding: '1rem 1.25rem', borderColor: '#e05a5a40', background: '#e05a5a08' }}>
    <p style={{ color: '#e05a5a', fontSize: '0.825rem' }}>{message}</p>
  </div>
)

// ── Component ─────────────────────────────────────────────────────────────────

export default function Admin() {
  const [tab, setTab] = useState('members')

  // Members
  const [members,        setMembers]        = useState([])
  const [memberFilter,   setMemberFilter]   = useState('all')
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError,   setMembersError]   = useState(null)
  const [updatingMember, setUpdatingMember] = useState(null)
  const [memberMutationError, setMemberMutationError] = useState('')

  // Content
  const [contentSection, setContentSection] = useState('videos')
  const [contentData,    setContentData]    = useState({ videos: [], calls: [], education: [], templates: [] })
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError,   setContentError]   = useState(null)
  const [showModal,      setShowModal]      = useState(false)
  const [editingRow,     setEditingRow]     = useState(null)
  const [newRow,         setNewRow]         = useState({})
  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState('')
  const [deletingId,     setDeletingId]     = useState(null)
  const [contentMutationError, setContentMutationError] = useState('')

  // Deals
  const [deals,        setDeals]        = useState([])
  const [dealsLoading, setDealsLoading] = useState(false)
  const [dealsError,   setDealsError]   = useState(null)
  const [updatingDeal, setUpdatingDeal] = useState(null)
  const [dealMutationError, setDealMutationError] = useState('')

  // ── Data loaders ────────────────────────────────────────────────────────────

  useEffect(() => { loadMembers() }, [])

  useEffect(() => {
    if (tab === 'content') loadContent(contentSection)
    if (tab === 'deals' && deals.length === 0) loadDeals()
  }, [tab, contentSection])

  async function loadMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('id, full_name, email, country, role, status')
      .order('full_name')
    if (error) setMembersError(error.message)
    else if (data) setMembers(data)
    setMembersLoading(false)
  }

  async function loadContent(section) {
    setContentLoading(true)
    setContentError(null)
    const { data, error } = await supabase
      .from(CONTENT_CONFIG[section].table)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setContentError(error.message)
    else if (data) setContentData(prev => ({ ...prev, [section]: data }))
    setContentLoading(false)
  }

  async function loadDeals() {
    setDealsLoading(true)
    const { data, error } = await supabase.from('deals').select('*').order('deal_name')
    if (error) setDealsError(error.message)
    else if (data) setDeals(data)
    setDealsLoading(false)
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function updateMemberStatus(id, status) {
    setUpdatingMember(id)
    setMemberMutationError('')
    const { error } = await supabase.from('members').update({ status }).eq('id', id)
    if (!error) setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    else setMemberMutationError(`Update failed: ${error.message}`)
    setUpdatingMember(null)
  }

  async function saveRow() {
    setSaving(true)
    setSaveError('')
    const cfg = CONTENT_CONFIG[contentSection]
    if (editingRow) {
      const { error } = await supabase.from(cfg.table).update(newRow).eq('id', editingRow.id)
      if (!error) {
        setContentData(prev => ({
          ...prev,
          [contentSection]: prev[contentSection].map(r => r.id === editingRow.id ? { ...r, ...newRow } : r),
        }))
        setShowModal(false)
        setEditingRow(null)
        setNewRow({})
      } else {
        setSaveError(error.message || 'Failed to save.')
      }
    } else {
      const { data, error } = await supabase.from(cfg.table).insert([newRow]).select()
      if (!error && data) {
        setContentData(prev => ({ ...prev, [contentSection]: [data[0], ...prev[contentSection]] }))
        setShowModal(false)
        setNewRow({})
      } else {
        setSaveError(error?.message || 'Failed to save. Check required fields.')
      }
    }
    setSaving(false)
  }

  async function deleteRow(id) {
    setDeletingId(id)
    setContentMutationError('')
    const { error } = await supabase.from(CONTENT_CONFIG[contentSection].table).delete().eq('id', id)
    if (!error) setContentData(prev => ({
      ...prev,
      [contentSection]: prev[contentSection].filter(r => r.id !== id),
    }))
    else setContentMutationError(`Delete failed: ${error.message}`)
    setDeletingId(null)
  }

  async function updateDealStage(id, stage) {
    setUpdatingDeal(id)
    setDealMutationError('')
    const { error } = await supabase.from('deals').update({ stage }).eq('id', id)
    if (!error) setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
    else setDealMutationError(`Stage update failed: ${error.message}`)
    setUpdatingDeal(null)
  }

  // ── Style helpers ────────────────────────────────────────────────────────────

  const mainTab = (active) => ({
    padding: '0.55rem 1.25rem',
    background: active ? 'var(--gold)' : 'var(--bg-card)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: '1px solid ' + (active ? 'var(--gold)' : 'var(--border)'),
    borderRadius: '0.5rem', fontSize: '0.82rem',
    fontWeight: active ? 700 : 400, cursor: 'pointer',
    fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
  })

  const subTab = (active) => ({
    padding: '0.55rem 1.1rem',
    background: 'transparent',
    color: active ? 'var(--gold)' : 'var(--text-muted)',
    border: 'none',
    borderBottom: '2px solid ' + (active ? 'var(--gold)' : 'transparent'),
    fontSize: '0.8rem', fontWeight: active ? 600 : 400,
    cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
  })

  const filterPill = (active) => ({
    background: active ? 'var(--gold)' : 'var(--bg-card)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '0.25rem 0.85rem', borderRadius: '999px',
    fontSize: '0.72rem', cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400, textTransform: 'capitalize',
  })

  // hex colors only — no CSS variable refs, so opacity suffixes work
  const actionBtn = (hexColor, disabled) => ({
    background: hexColor + '18', color: hexColor,
    border: '1px solid ' + hexColor + '40',
    padding: '0.25rem 0.7rem', borderRadius: '0.35rem',
    fontSize: '0.7rem', fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-body)',
    opacity: disabled ? 0.35 : 1,
  })

  // ── Derived ──────────────────────────────────────────────────────────────────

  const counts = {
    all:      members.length,
    pending:  members.filter(m => m.status === 'pending').length,
    approved: members.filter(m => m.status === 'approved').length,
  }

  const visibleMembers = memberFilter === 'all'
    ? members
    : members.filter(m => m.status === memberFilter)

  const cfg            = CONTENT_CONFIG[contentSection]
  const currentContent = contentData[contentSection] || []

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* ── Sticky nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-primary)',
      }}>
        <img src="/logo.png" alt="TRN" style={{ height: '1.65rem', width: 'auto' }} />
        <div style={{ width: '1px', height: '1.25rem', background: 'var(--border)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600 }}>
          Admin Dashboard
        </span>
        <Link
          to="/dashboard"
          style={{
            marginLeft: 'auto', color: 'var(--text-muted)',
            fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.75rem 1rem' }}>

        {/* ── Main tabs ── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['members', 'content', 'deals'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={mainTab(tab === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            MEMBERS TAB
        ════════════════════════════════════════ */}
        {tab === 'members' && (
          <>
            {/* Stat row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                ['Total',    counts.all,      'var(--text-primary)'],
                ['Pending',  counts.pending,  '#d7a042'],
                ['Approved', counts.approved, '#4caf50'],
              ].map(([label, count, color]) => (
                <div key={label} className="card" style={{ padding: '0.875rem 1.5rem', minWidth: '5.5rem', textAlign: 'center' }}>
                  <p style={{ color, fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {count}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.3rem' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['all', 'pending', 'approved'].map(f => (
                <button key={f} onClick={() => setMemberFilter(f)} style={filterPill(memberFilter === f)}>
                  {f} ({counts[f]})
                </button>
              ))}
            </div>

            {/* Mutation error */}
            {memberMutationError && (
              <div style={{ marginBottom: '1rem' }}>
                <ErrorCard message={memberMutationError} />
              </div>
            )}

            {membersLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading members…</p>
            ) : membersError ? (
              <ErrorCard message={membersError} />
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Country', 'Role', 'Status', 'Actions'].map(h => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>
                          No members.
                        </td>
                      </tr>
                    ) : visibleMembers.map(m => (
                      <tr key={m.id} style={{ background: 'var(--bg-card)' }}>
                        <td style={{ ...TD, fontWeight: 600 }}>{m.full_name}</td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{m.email}</td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{m.country || '—'}</td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{m.role || '—'}</td>
                        <td style={TD}>
                          <span style={{
                            fontSize: '0.65rem', padding: '0.15rem 0.6rem',
                            borderRadius: '999px', textTransform: 'capitalize',
                            color:      STATUS_COLOR[m.status] || 'var(--text-muted)',
                            background: (STATUS_COLOR[m.status] || '#888888') + '18',
                            border: '1px solid ' + (STATUS_COLOR[m.status] || '#888888') + '40',
                          }}>{m.status}</span>
                        </td>
                        <td style={TD}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => updateMemberStatus(m.id, 'approved')}
                              disabled={m.status === 'approved' || updatingMember === m.id}
                              style={actionBtn('#4caf50', m.status === 'approved' || updatingMember === m.id)}
                            >
                              {updatingMember === m.id ? '…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => updateMemberStatus(m.id, 'pending')}
                              disabled={m.status === 'pending' || updatingMember === m.id}
                              style={actionBtn('#d7a042', m.status === 'pending' || updatingMember === m.id)}
                            >
                              {updatingMember === m.id ? '…' : 'Revoke'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            CONTENT TAB
        ════════════════════════════════════════ */}
        {tab === 'content' && (
          <>
            {/* Sub-section tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border)',
              marginBottom: '1.5rem', overflowX: 'auto',
            }}>
              {Object.entries(CONTENT_CONFIG).map(([key, c]) => (
                <button key={key} onClick={() => setContentSection(key)} style={subTab(contentSection === key)}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Section header + Add button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="section-label" style={{ margin: 0 }}>{cfg.label}</p>
              <button
                onClick={() => { setEditingRow(null); setNewRow({}); setSaveError(''); setShowModal(true) }}
                style={{
                  background: 'var(--gold)', color: 'var(--bg-primary)',
                  border: 'none', borderRadius: '0.4rem',
                  padding: '0.4rem 1rem', fontSize: '0.75rem',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                + Add
              </button>
            </div>

            {/* Mutation error */}
            {contentMutationError && (
              <div style={{ marginBottom: '1rem' }}>
                <ErrorCard message={contentMutationError} />
              </div>
            )}

            {contentLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
            ) : contentError ? (
              <ErrorCard message={contentError} />
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      {contentSection === 'videos' && <th style={TH}>Preview</th>}
                      {cfg.columns.map(c => (
                        <th key={c} style={TH}>{c.replace(/_/g, ' ')}</th>
                      ))}
                      <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentContent.length === 0 ? (
                      <tr>
                        <td colSpan={cfg.columns.length + 1 + (contentSection === 'videos' ? 1 : 0)} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>
                          No entries yet. Click + Add to create one.
                        </td>
                      </tr>
                    ) : currentContent.map(row => (
                      <tr key={row.id} style={{ background: 'var(--bg-card)' }}>
                        {contentSection === 'videos' && (
                          <td style={TD}>
                            {getVideoId(row.embed_url) ? (
                              <img
                                src={`https://img.youtube.com/vi/${getVideoId(row.embed_url)}/mqdefault.jpg`}
                                alt=""
                                style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '0.3rem', display: 'block' }}
                              />
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                          </td>
                        )}
                        {cfg.columns.map((col, i) => (
                          <td key={col} style={{
                            ...TD,
                            color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                            maxWidth: '220px', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {row[col] || '—'}
                          </td>
                        ))}
                        <td style={{ ...TD, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                const prefilled = {}
                                cfg.fields.forEach(f => { prefilled[f.key] = row[f.key] ?? '' })
                                setEditingRow(row)
                                setNewRow(prefilled)
                                setSaveError('')
                                setShowModal(true)
                              }}
                              style={actionBtn('#d7a042', false)}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRow(row.id)}
                              disabled={deletingId === row.id}
                              style={actionBtn('#e05a5a', deletingId === row.id)}
                            >
                              {deletingId === row.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            DEALS TAB
        ════════════════════════════════════════ */}
        {tab === 'deals' && (
          <>
            <p className="section-label">All Deals</p>

            {/* Mutation error */}
            {dealMutationError && (
              <div style={{ marginBottom: '1rem' }}>
                <ErrorCard message={dealMutationError} />
              </div>
            )}

            {dealsLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
            ) : dealsError ? (
              <ErrorCard message={dealsError} />
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                  <thead>
                    <tr>
                      {['Deal Name', 'Originating Agent', 'Destination Agent', 'Stage'].map(h => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deals.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>
                          No deals yet.
                        </td>
                      </tr>
                    ) : deals.map(d => (
                      <tr key={d.id} style={{ background: 'var(--bg-card)' }}>
                        <td style={{ ...TD, fontWeight: 600 }}>{d.deal_name}</td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{d.originating_agent  || '—'}</td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{d.destination_agent  || '—'}</td>
                        <td style={TD}>
                          <select
                            value={d.stage || ''}
                            onChange={e => updateDealStage(d.id, e.target.value)}
                            disabled={updatingDeal === d.id}
                            style={{
                              background: 'var(--bg-primary)', color: 'var(--gold)',
                              border: '1px solid var(--border)', borderRadius: '0.35rem',
                              padding: '0.3rem 0.6rem', fontSize: '0.75rem',
                              fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
                            }}
                          >
                            {!d.stage && <option value="">— set stage —</option>}
                            {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>

      {/* ════════════════════════════════════════
          ADD MODAL
      ════════════════════════════════════════ */}
      {showModal && (
        <div
          onClick={() => { setShowModal(false); setEditingRow(null) }}
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
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}>
                {editingRow ? `Edit ${cfg.label}` : `Add ${cfg.label}`}
              </p>
              <button
                onClick={() => { setShowModal(false); setEditingRow(null) }}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', width: '1.75rem', height: '1.75rem',
                  borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >×</button>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cfg.fields.map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>
                    {f.label}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={newRow[f.key] || ''}
                      onChange={e => setNewRow(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', borderRadius: '0.4rem',
                        padding: '0.6rem 0.75rem', fontSize: '0.825rem',
                        fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical',
                      }}
                    />
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder || ''}
                      value={newRow[f.key] || ''}
                      onChange={e => setNewRow(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', borderRadius: '0.4rem',
                        padding: '0.6rem 0.75rem', fontSize: '0.825rem',
                        fontFamily: 'var(--font-body)', outline: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Save error */}
            {saveError && (
              <div style={{ marginTop: '1rem' }}>
                <ErrorCard message={saveError} />
              </div>
            )}

            {/* Save button */}
            <button
              onClick={saveRow}
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

    </div>
  )
}
