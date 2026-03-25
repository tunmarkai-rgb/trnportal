import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'

function MemberModal({ member, onClose }) {
  const initials = member.full_name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }`}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '1.25rem',
            padding: '1.75rem 1.5rem 2rem',
            width: '100%', maxWidth: '480px', maxHeight: '88vh',
            overflowY: 'auto',
            animation: 'fadeInUp 0.22s ease-out',
          }}
        >
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', borderRadius: '50%',
                width: '2rem', height: '2rem', cursor: 'pointer',
                fontSize: '1.1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-body)', flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  objectFit: 'cover', border: '2px solid var(--border-gold)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--gold-dim)', border: '2px solid var(--border-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', fontWeight: 700, fontSize: '1.5rem',
                fontFamily: 'var(--font-display)', flexShrink: 0,
              }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
                fontWeight: 700, lineHeight: 1.2, marginBottom: '0.4rem',
              }}>
                {member.full_name}
              </h2>
              {member.role && (
                <span style={{
                  display: 'inline-block',
                  background: 'var(--gold-dim)', color: 'var(--gold)',
                  fontSize: '0.7rem', padding: '0.2rem 0.75rem',
                  borderRadius: '999px', letterSpacing: '0.04em', fontWeight: 600,
                }}>
                  {member.role}
                </span>
              )}
            </div>
          </div>

          {/* Location + Agency */}
          {(member.city || member.country || member.agency) && (
            <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
              {(member.city || member.country) && (
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.85rem',
                  marginBottom: member.agency ? '0.35rem' : 0,
                }}>
                  📍 {[member.city, member.country].filter(Boolean).join(', ')}
                </p>
              )}
              {member.agency && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  🏢 {member.agency}
                </p>
              )}
            </div>
          )}

          {/* Niche */}
          {member.niche?.length > 0 && (
            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.63rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.45rem',
              }}>Niche</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {member.niche.map(n => (
                  <span key={n} style={{
                    background: 'var(--gold-dim)', color: 'var(--gold)',
                    fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                    borderRadius: '999px', letterSpacing: '0.03em',
                  }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {member.languages?.length > 0 && (
            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.63rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.45rem',
              }}>Languages</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {member.languages.map(l => (
                  <span key={l} style={{
                    background: 'var(--bg-primary)', color: 'var(--text-secondary)',
                    fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                    borderRadius: '999px', border: '1px solid var(--border)',
                    letterSpacing: '0.03em',
                  }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Can Help With */}
          {member.can_help_with && (
            <div style={{ marginBottom: '1.1rem' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.63rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem',
              }}>Can Help With</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {member.can_help_with}
              </p>
            </div>
          )}

          {/* Looking For */}
          {member.looking_for && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.63rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem',
              }}>Looking For</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {member.looking_for}
              </p>
            </div>
          )}

          {/* Contact Buttons */}
          {(member.whatsapp || member.instagram || member.linkedin) && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {member.whatsapp && (
                <a
                  href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--gold)', color: 'var(--bg-primary)',
                    fontSize: '0.78rem', fontWeight: 700,
                    padding: '0.55rem 1.1rem', borderRadius: '0.5rem',
                    letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  }}
                >
                  WhatsApp
                </a>
              )}
              {member.instagram && (
                <a
                  href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem', fontWeight: 600,
                    padding: '0.55rem 1.1rem', borderRadius: '0.5rem',
                    letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  }}
                >
                  Instagram
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem', fontWeight: 600,
                    padding: '0.55rem 1.1rem', borderRadius: '0.5rem',
                    letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  }}
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function MemberDirectory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('All')
  const [niche, setNiche] = useState('All')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    supabase
      .from('members')
      .select('id, full_name, country, city, role, niche, status, avatar_url, agency, languages, can_help_with, looking_for, whatsapp, instagram, linkedin')
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

      {selectedMember && (
        <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Member Directory</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!loading && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          <ThemeToggle />
        </div>
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
              <div
                key={m.id}
                className="card"
                onClick={() => setSelectedMember(m)}
                style={{ padding: '1.25rem', cursor: 'pointer' }}
              >
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt={m.full_name}
                    style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                      objectFit: 'cover', border: '1px solid var(--border-gold)',
                      marginBottom: '0.75rem', display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                    background: 'var(--gold-dim)', border: '1px solid var(--border-gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.75rem', color: 'var(--gold)',
                    fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}>
                    {m.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                  {m.full_name}
                </p>
                <p style={{ color: 'var(--gold)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{m.role}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                  {[m.city, m.country].filter(Boolean).join(', ')}
                </p>
                {m.niche?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
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
