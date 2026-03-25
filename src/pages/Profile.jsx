import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NICHE_OPTIONS = [
  'Residential', 'Commercial', 'Luxury', 'Investment', 'Land',
  'New Developments', 'Short-Term Rentals', 'Property Management',
]
const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'Arabic', 'Portuguese',
  'Mandarin', 'German', 'Italian', 'Russian', 'Dutch', 'Turkish', 'Swahili',
]

const inputStyle = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '0.6rem',
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.68rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
  display: 'block',
}

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [form, setForm] = useState({
    full_name: '', whatsapp: '', country: '', city: '', agency: '',
    role: '', niche: [], languages: [], can_help_with: '', looking_for: '',
    instagram: '', linkedin: '', bio: '', avatar_url: '',
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email)

      const { data } = await supabase
        .from('members')
        .select('full_name, whatsapp, country, city, agency, role, niche, languages, can_help_with, looking_for, instagram, linkedin, bio, avatar_url')
        .eq('email', user.email)
        .single()

      if (data) {
        setForm({
          full_name: data.full_name || '',
          whatsapp: data.whatsapp || '',
          country: data.country || '',
          city: data.city || '',
          agency: data.agency || '',
          role: data.role || '',
          niche: data.niche || [],
          languages: data.languages || [],
          can_help_with: data.can_help_with || '',
          looking_for: data.looking_for || '',
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setForm(f => ({ ...f, avatar_url: urlData.publicUrl }))
    }
    setAvatarUploading(false)
  }

  function toggleArray(field, value) {
    setSaveSuccess(false)
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }))
  }

  const set = (field) => (e) => {
    setSaveSuccess(false)
    setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const { error } = await supabase
      .from('members')
      .update({
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        country: form.country,
        city: form.city,
        agency: form.agency,
        role: form.role,
        niche: form.niche,
        languages: form.languages,
        can_help_with: form.can_help_with,
        looking_for: form.looking_for,
        instagram: form.instagram,
        linkedin: form.linkedin,
        bio: form.bio,
        avatar_url: form.avatar_url,
      })
      .eq('email', userEmail)

    if (error) setSaveError(error.message)
    else setSaveSuccess(true)
    setSaving(false)
  }

  const tagPill = (active) => ({
    background: active ? 'var(--gold)' : 'var(--bg-primary)',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    padding: '0.3rem 0.8rem', borderRadius: '999px',
    fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 400,
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>My Profile</span>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Avatar upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'var(--gold-dim)', border: '2px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', marginBottom: '0.75rem',
            }}
          >
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>
                {form.full_name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: avatarUploading ? 'var(--text-muted)' : 'var(--gold)',
              fontSize: '0.75rem', padding: '0.35rem 1rem', borderRadius: '0.4rem',
              cursor: avatarUploading ? 'default' : 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            {avatarUploading ? 'Uploading…' : 'Change Photo'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} value={form.country} onChange={set('country')} placeholder="Country" />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={form.city} onChange={set('city')} placeholder="City" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Agency / Company</label>
            <input style={inputStyle} value={form.agency} onChange={set('agency')} placeholder="Agency or company name" />
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <input style={inputStyle} value={form.role} onChange={set('role')} placeholder="e.g. Buyer's Agent, Luxury Specialist" />
          </div>

          <div>
            <label style={labelStyle}>WhatsApp Number</label>
            <input style={inputStyle} value={form.whatsapp} onChange={set('whatsapp')} placeholder="+1 234 567 8900 (include country code)" />
          </div>

          <div>
            <label style={labelStyle}>Niche</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {NICHE_OPTIONS.map(n => (
                <button key={n} type="button" onClick={() => toggleArray('niche', n)} style={tagPill(form.niche.includes(n))}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Languages</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {LANGUAGE_OPTIONS.map(l => (
                <button key={l} type="button" onClick={() => toggleArray('languages', l)} style={tagPill(form.languages.includes(l))}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Can Help With</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.can_help_with}
              onChange={set('can_help_with')}
              placeholder="What can you help other members with?"
            />
          </div>

          <div>
            <label style={labelStyle}>Looking For</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.looking_for}
              onChange={set('looking_for')}
              placeholder="What are you looking for from the network?"
            />
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={form.bio}
              onChange={set('bio')}
              placeholder="A short bio about you and your work…"
            />
          </div>

          <p className="section-label" style={{ marginTop: '0.25rem' }}>Contact & Social</p>

          <div>
            <label style={labelStyle}>Instagram Handle</label>
            <input style={inputStyle} value={form.instagram} onChange={set('instagram')} placeholder="@handle or handle without @" />
          </div>

          <div>
            <label style={labelStyle}>LinkedIn</label>
            <input style={inputStyle} value={form.linkedin} onChange={set('linkedin')} placeholder="Profile URL or username" />
          </div>

          {saveError && (
            <div className="card" style={{ padding: '0.875rem 1rem' }}>
              <p style={{ color: '#e05a5a', fontSize: '0.8rem' }}>{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="card" style={{ padding: '0.875rem 1rem' }}>
              <p style={{ color: '#4caf50', fontSize: '0.8rem' }}>Profile saved successfully.</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? 'var(--gold-dim)' : 'var(--gold)',
              color: 'var(--bg-primary)',
              border: 'none', borderRadius: '0.75rem',
              padding: '0.9rem 2rem', fontSize: '0.9rem',
              fontWeight: 700, cursor: saving ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
              width: '100%', marginTop: '0.5rem',
            }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>

        </div>
      </div>
    </div>
  )
}
