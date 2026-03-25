import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    title: 'Complete Your Profile',
    desc: 'Make sure your full name, country, city, role, and niche are up to date so other members can find and connect with you.',
  },
  {
    number: '02',
    title: 'Join the WhatsApp Community',
    desc: 'Get real-time updates, deal alerts, and direct access to the TRN network via our members-only WhatsApp group.',
    action: true,
  },
  {
    number: '03',
    title: 'Browse the Member Directory',
    desc: 'Explore agents from around the world. Filter by country and niche to find the right referral partners for your market.',
    link: '/directory',
    linkLabel: 'Go to Directory →',
  },
  {
    number: '04',
    title: 'Attend a Live Call',
    desc: 'Join our weekly network calls to meet other members, share deals, and stay connected with the global TRN community.',
    link: '/calls',
    linkLabel: 'View Upcoming Calls →',
  },
  {
    number: '05',
    title: 'Watch the Video Library',
    desc: 'Catch up on recorded sessions covering referral strategy, market insights, and how to close cross-border deals.',
    link: '/videos',
    linkLabel: 'Browse Videos →',
  },
  {
    number: '06',
    title: 'Download Referral Templates',
    desc: 'Use our professional referral agreements and contracts to formalise your deals with TRN partners worldwide.',
    link: '/templates',
    linkLabel: 'View Templates →',
  },
]

const WHATSAPP_LINK = 'https://chat.whatsapp.com/trn-members'

export default function Onboarding() {
  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Getting Started</span>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-warm) 0%, var(--bg-card) 65%)',
          border: '1px solid var(--gold-dim)',
          borderRadius: '1rem',
          padding: '2rem 1.75rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'var(--gold)', filter: 'blur(70px)', opacity: 0.08,
          }} />
          <p style={{
            color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: '0.6rem',
          }}>
            Welcome to TRN
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
            fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2,
          }}>
            The Realty Network
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '480px' }}>
            You're now part of a private global network of real estate professionals.
            Follow the steps below to get the most out of your membership.
          </p>
        </div>

        {/* Profile Callout */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
          marginBottom: '1.25rem', flexWrap: 'wrap',
          borderColor: 'var(--border-gold)',
          background: 'linear-gradient(135deg, var(--bg-warm) 0%, var(--bg-card) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '1.75rem' }}>👤</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Complete Your Profile</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Add your photo and contact details so other members can find and reach you.</p>
            </div>
          </div>
          <Link
            to="/profile"
            style={{
              background: 'var(--gold)', color: 'var(--bg-primary)',
              fontSize: '0.75rem', fontWeight: 700,
              padding: '0.5rem 1.25rem', borderRadius: '0.4rem',
              whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '0.04em',
            }}
          >
            Update My Profile →
          </Link>
        </div>

        {/* WhatsApp CTA */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
          marginBottom: '2rem', flexWrap: 'wrap',
          borderColor: 'var(--border-gold)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '1.75rem' }}>💬</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Join the WhatsApp Community</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Members-only group for deals, updates & networking</p>
            </div>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--gold)', color: 'var(--bg-primary)',
              fontSize: '0.75rem', fontWeight: 700,
              padding: '0.5rem 1.25rem', borderRadius: '0.4rem',
              whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '0.04em',
            }}
          >
            Join Now
          </a>
        </div>

        {/* Steps */}
        <p className="section-label">Getting Started Steps</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.map((step, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <span style={{
                color: 'var(--gold)', fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
                lineHeight: 1.3, minWidth: '2rem',
              }}>{step.number}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>{step.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: step.link ? '0.65rem' : 0 }}>
                  {step.desc}
                </p>
                {step.link && (
                  <Link to={step.link} style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {step.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
