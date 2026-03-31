import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ROLE_OPTIONS = ['Agent', 'Broker', 'Investor', 'Developer', 'Founder', 'Other']

const EMPTY_FORM = {
  first_name: '', last_name: '', whatsapp: '', email: '',
  country: '', city: '', role: '', instagram: '', linkedin: '',
  how_did_you_hear: '',
}

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

export default function CommunityJoin() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('community_members')
      .insert([{
        first_name:       form.first_name.trim(),
        last_name:        form.last_name.trim(),
        whatsapp:         form.whatsapp.trim(),
        email:            form.email.trim() || null,
        country:          form.country.trim(),
        city:             form.city.trim() || null,
        role:             form.role || null,
        instagram:        form.instagram.trim() || null,
        linkedin:         form.linkedin.trim() || null,
        how_did_you_hear: form.how_did_you_hear.trim() || null,
      }])

    if (insertError) {
      setError(insertError.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1rem 5rem',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <img
          src="/logo.png"
          alt="The Realty Network"
          style={{ height: '3.5rem', width: 'auto', marginBottom: '1rem' }}
        />
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}>
          Free Community
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '2.25rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Gold glow accent */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '220px', height: '220px', borderRadius: '50%',
          background: 'var(--gold)', filter: 'blur(90px)', opacity: 0.06,
          pointerEvents: 'none',
        }} />

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#4caf5018', border: '1px solid #4caf5040',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.5rem',
            }}>
              ✓
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem', fontWeight: 700,
              marginBottom: '0.75rem',
            }}>
              You're in!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Welcome to the community. Click below to join the WhatsApp group.
            </p>
            <a
              href="https://chat.whatsapp.com/Gm1sPJ7B0NcF1HrjXuukXx"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--gold)',
                color: 'var(--bg-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 700,
                padding: '0.75rem 1.75rem',
                borderRadius: '0.6rem',
                letterSpacing: '0.04em',
              }}
            >
              Join WhatsApp Community →
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <p style={{
                color: 'var(--gold)', fontSize: '0.6rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                Free Access
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                fontWeight: 700, lineHeight: 1.2, marginBottom: '0.5rem',
              }}>
                Join The Realty Network Community
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.6 }}>
                Connect with real estate professionals worldwide. Free access.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    style={inputStyle}
                    value={form.first_name}
                    onChange={set('first_name')}
                    placeholder="Jane"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    style={inputStyle}
                    value={form.last_name}
                    onChange={set('last_name')}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>WhatsApp Number *</label>
                <input
                  style={inputStyle}
                  value={form.whatsapp}
                  onChange={set('whatsapp')}
                  placeholder="+1 234 567 8900 (include country code)"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                />
              </div>

              {/* Country / City row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Country *</label>
                  <input
                    style={inputStyle}
                    value={form.country}
                    onChange={set('country')}
                    placeholder="Country"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    style={inputStyle}
                    value={form.city}
                    onChange={set('city')}
                    placeholder="City"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  style={{ ...inputStyle, color: form.role ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  value={form.role}
                  onChange={set('role')}
                  required
                >
                  <option value="">— select your role —</option>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Instagram Handle</label>
                <input
                  style={inputStyle}
                  value={form.instagram}
                  onChange={set('instagram')}
                  placeholder="@handle"
                />
              </div>

              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input
                  style={inputStyle}
                  value={form.linkedin}
                  onChange={set('linkedin')}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label style={labelStyle}>How did you hear about us?</label>
                <input
                  style={inputStyle}
                  value={form.how_did_you_hear}
                  onChange={set('how_did_you_hear')}
                  placeholder="Referral, Instagram, Google…"
                />
              </div>

              {error && (
                <p style={{
                  color: '#e05a5a', fontSize: '0.8rem',
                  fontFamily: 'var(--font-body)', lineHeight: 1.5,
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? 'var(--gold-dim)' : 'var(--gold)',
                  color: 'var(--bg-primary)',
                  border: 'none', borderRadius: '0.6rem',
                  padding: '0.9rem',
                  fontSize: '0.875rem', fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.04em',
                  marginTop: '0.25rem',
                }}
              >
                {submitting ? 'Submitting…' : 'Join the Community'}
              </button>

            </form>
          </>
        )}

      </div>

      {/* Footer */}
      <p style={{
        marginTop: '2rem',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        textAlign: 'center',
      }}>
        Already a paying member?{' '}
        <Link to="/login" style={{ color: 'var(--gold)' }}>
          Sign in here
        </Link>
      </p>

    </div>
  )
}
