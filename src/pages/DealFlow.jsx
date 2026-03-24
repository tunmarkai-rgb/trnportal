import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CLOSED_STAGES = ['Closed', 'Commission Collected', 'Completed']

export default function DealFlow() {
  const [deals, setDeals] = useState([])
  const [tab, setTab] = useState('pipeline')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('deals')
      .select('*')
      .order('deal_name')
      .then(({ data }) => {
        if (data) setDeals(data)
        setLoading(false)
      })
  }, [])

  const pipeline = deals.filter(d => !CLOSED_STAGES.includes(d.stage))
  const closed = deals.filter(d => CLOSED_STAGES.includes(d.stage))
  const visible = tab === 'pipeline' ? pipeline : closed

  const stageColor = (stage) => {
    if (!stage) return 'var(--text-muted)'
    const s = stage.toLowerCase()
    if (s.includes('closed') || s.includes('collected') || s.includes('completed')) return '#4caf50'
    if (s.includes('active') || s.includes('negotiat')) return 'var(--gold)'
    if (s.includes('prospect') || s.includes('lead')) return 'var(--text-secondary)'
    return 'var(--text-secondary)'
  }

  const tabStyle = (active) => ({
    flex: 1, padding: '0.65rem 1rem',
    background: active ? 'var(--gold)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
    border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: active ? 700 : 400,
    borderRadius: active ? '0.5rem' : '0',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-primary)'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Deal Flow</span>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Tabs */}
        <div className="card" style={{
          display: 'flex', padding: '0.3rem',
          marginBottom: '1.75rem', gap: '0.25rem',
        }}>
          <button onClick={() => setTab('pipeline')} style={tabStyle(tab === 'pipeline')}>
            In Pipeline ({pipeline.length})
          </button>
          <button onClick={() => setTab('closed')} style={tabStyle(tab === 'closed')}>
            Commissions Collected ({closed.length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading deals…</p>
        ) : visible.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {tab === 'pipeline' ? 'No active deals in pipeline.' : 'No commissions collected yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {visible.map((deal, i) => (
              <div key={i} className="card" style={{ padding: '1.1rem 1.25rem' }}>

                {/* Deal name + stage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{deal.deal_name}</p>
                  {deal.stage && (
                    <span style={{
                      fontSize: '0.65rem', padding: '0.2rem 0.7rem',
                      borderRadius: '999px', letterSpacing: '0.04em',
                      color: stageColor(deal.stage),
                      border: `1px solid ${stageColor(deal.stage)}40`,
                      background: `${stageColor(deal.stage)}12`,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{deal.stage}</span>
                  )}
                </div>

                {/* Agents */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {deal.originating_agent && (
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                        Originating Agent
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{deal.originating_agent}</p>
                    </div>
                  )}
                  {deal.destination_agent && (
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                        Destination Agent
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{deal.destination_agent}</p>
                    </div>
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
