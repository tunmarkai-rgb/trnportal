import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '0.6rem',
    padding: '0.8rem 1rem',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>

      {/* Logo — above the card */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <img
          src="/logo.png"
          alt="The Realty Network"
          style={{ height: '3.5rem', width: 'auto', marginBottom: '0.875rem' }}
        />
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}>
          Member Headquarters
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '2.25rem 2rem',
      }}>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.3rem',
        }}>
          Sign In
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginBottom: '2rem',
        }}>
          Access your TRN member portal
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{
              color: '#e05a5a',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--gold-dim)' : 'var(--gold)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '0.6rem',
              padding: '0.875rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.72rem',
          marginTop: '1.75rem',
          lineHeight: 1.6,
        }}>
          Access is restricted to approved TRN members only.
        </p>

      </div>
    </div>
  )
}
