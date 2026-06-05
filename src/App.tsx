import { useState } from 'react'

const GROUPS = [
  { name: 'recon', count: 149 },
  { name: 'defense', count: 132 },
  { name: 'cloud', count: 109 },
  { name: 'web', count: 74 },
  { name: 'network', count: 74 },
  { name: 'identity', count: 54 },
  { name: 'specialized', count: 51 },
  { name: 'exploit', count: 50 },
  { name: 'malware', count: 39 },
  { name: 'vuln-mgmt', count: 25 },
  { name: 'compliance', count: 7 },
]

function App() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
          ⚔️ arsenal <span style={{ color: 'var(--red)' }}>web</span>
        </span>
        <a href="https://github.com/dazeb/arsenal-cli"
           style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: '0.88rem' }}>
          GitHub
        </a>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 24px 80px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
          Arsenal CLI
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--dim)', marginBottom: 32 }}>
          An agent-driven offensive security lab in your terminal.
          764 cybersecurity skills, 22 vulnerable targets, arrow-key TUI.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/dazeb/arsenal-cli"
             style={{
               display: 'inline-flex', alignItems: 'center', gap: 8,
               padding: '10px 22px', borderRadius: 5, background: 'var(--red)',
               color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.92rem'
             }}>
            ⬇ Get Started
          </a>
          <button onClick={() => setOpen(!open)}
                  style={{
                    padding: '10px 22px', borderRadius: 5,
                    background: 'var(--bg2)', color: 'var(--text)',
                    border: '1px solid var(--border)', fontWeight: 600,
                    cursor: 'pointer', fontSize: '0.92rem'
                  }}>
            {open ? 'Hide' : 'Show'} Stats
          </button>
        </div>
      </section>

      {/* Stats */}
      {open && (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12, marginBottom: 40
          }}>
            {[
              { n: '764', l: 'Skills' },
              { n: '11', l: 'Groups' },
              { n: '40+', l: 'Categories' },
              { n: '22', l: 'Lab Targets' },
            ].map(s => (
              <div key={s.l} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 5, padding: '20px 16px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--red)', fontFamily: 'monospace' }}>
                  {s.n}
                </div>
                <div style={{ color: 'var(--dim)', fontSize: '0.82rem', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Skill groups */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {GROUPS.map(g => (
              <div key={g.name} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 5, padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{g.name}</span>
                <span style={{ color: 'var(--red)', fontFamily: 'monospace', fontWeight: 700 }}>
                  {g.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Terminal Preview */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          background: '#0d0d14', border: '1px solid var(--border)',
          borderRadius: 5, overflow: 'hidden', fontFamily: 'monospace', fontSize: '0.8rem'
        }}>
          <div style={{
            background: 'var(--bg3)', padding: '8px 14px', display: 'flex', gap: 7,
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: 'var(--red)' }}/>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: '#ffb300' }}/>
            <span style={{ width: 10, height: 10, borderRadius: 10, background: 'var(--green)' }}/>
          </div>
          <pre style={{ padding: '16px 18px', lineHeight: 1.55, overflowX: 'auto' }}>
            <span style={{ color: 'var(--dim)' }}>{`⚔️ ARSENAL  764 skills · 11 groups · 22 targets`}</span>{'\n'}
            <span style={{ color: 'var(--dim)' }}>{`[1] Skills  [2] Plans  [3] Targets  [4] Sessions  [5] Help`}</span>{'\n'}
            <span style={{ color: 'var(--dim)' }}>{`───────────────────────────────────────────────`}</span>{'\n'}
            <span style={{ color: 'var(--green)' }}>/</span><span>{` sqli                          `}</span><span style={{ color: 'var(--dim)' }}>{`(8 results)`}</span>{'\n'}
            <span style={{ color: 'var(--red)' }}>{` ▸ exploiting-sqli-vulnerabilities`}</span>{'\n'}
            <span style={{ color: 'var(--dim)' }}>{`───────────────────────────────────────────────`}</span>{'\n'}
            <span style={{ color: 'var(--dim)' }}>{`←→ tab  │  ↑↓ nav  │  / search  │  1-5 tab  │  q quit`}</span>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '40px 24px',
        color: 'var(--dim)', fontSize: '0.82rem',
        borderTop: '1px solid var(--border)'
      }}>
        <p>Arsenal CLI — open source under <a href="https://github.com/dazeb/arsenal-cli" style={{ color: 'var(--red)' }}>MIT license</a></p>
      </footer>
    </div>
  )
}

export default App
