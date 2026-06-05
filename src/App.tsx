import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = { id: number; name: string; icon: string; status: 'pending' | 'active' | 'done' }
type LogEntry = { time: string; text: string; type: 'cmd' | 'out' | 'ok' | 'err' | 'info' }
type SkillMatch = { group: string; id: string; score: number }

const TARGET = '192.168.8.51'
const DELAY = 600

const INITIAL_PHASES: Phase[] = [
  { id: 0, name: 'Triage', icon: '🔍', status: 'pending' },
  { id: 1, name: 'Recon', icon: '📡', status: 'pending' },
  { id: 2, name: 'Select', icon: '🎯', status: 'pending' },
  { id: 3, name: 'Execute', icon: '⚡', status: 'pending' },
  { id: 4, name: 'Report', icon: '📋', status: 'pending' },
  { id: 5, name: 'Lateral', icon: '🔗', status: 'pending' },
]

function now() { return new Date().toISOString().slice(11, 19) }

// ── Components ───────────────────────────────────────────────────────────────

function Header({ running, done }: { running: boolean; done: boolean }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>⚔️ Arsenal Agent</span>
        <span style={{
          fontSize: '0.7rem', padding: '2px 8px', borderRadius: 3, fontWeight: 600,
          background: done ? 'var(--green-dim)' : running ? 'var(--red-dim)' : 'var(--bg3)',
          color: done ? 'var(--green)' : running ? 'var(--red)' : 'var(--dim)',
          border: `1px solid ${done ? 'var(--green)' : running ? 'var(--red)' : 'var(--border)'}`
        }}>
          {done ? 'COMPLETE' : running ? 'LIVE' : 'IDLE'}
        </span>
      </div>
      <span style={{ color: 'var(--dim)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
        target: {TARGET}
      </span>
    </div>
  )
}

function PhasePanel({ phases }: { phases: Phase[] }) {
  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dim)', marginBottom: 10, letterSpacing: '0.05em' }}>
        PHASES
      </div>
      {phases.map((p, i) => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
          borderBottom: i < phases.length - 1 ? '1px solid var(--border)' : 'none',
          opacity: p.status === 'pending' ? 0.4 : 1
        }}>
          <span style={{ fontSize: '1rem' }}>{p.icon}</span>
          <span style={{
            fontWeight: p.status === 'active' ? 700 : 500,
            fontSize: '0.85rem',
            color: p.status === 'active' ? 'var(--red)' : p.status === 'done' ? 'var(--green)' : 'var(--dim)'
          }}>
            {p.name}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
            {p.status === 'active' ? '◉' : p.status === 'done' ? '✓' : '○'}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActivityLog({ entries, maxHeight }: { entries: LogEntry[]; maxHeight: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [entries])

  const color = (t: LogEntry['type']) =>
    t === 'cmd' ? 'var(--green)' : t === 'ok' ? 'var(--green)' :
    t === 'err' ? 'var(--red)' : t === 'info' ? 'var(--accent)' : 'var(--dim)'

  return (
    <div ref={ref} style={{
      background: '#0d0d14', border: '1px solid var(--border)', borderRadius: 5,
      height: maxHeight, overflow: 'auto', padding: '12px 14px',
      fontFamily: 'monospace', fontSize: '0.76rem', lineHeight: 1.6
    }}>
      {entries.map((e, i) => (
        <div key={i}>
          <span style={{ color: 'var(--dim)' }}>{e.time}</span>
          {' '}
          <span style={{ color: color(e.type) }}>
            {e.type === 'cmd' ? '$ ' : ''}{e.text}
          </span>
        </div>
      ))}
      {entries.length === 0 && (
        <span style={{ color: 'var(--dim)' }}>Waiting for agent to start...</span>
      )}
    </div>
  )
}

function SkillPanel({ skills }: { skills: SkillMatch[] }) {
  const grouped: Record<string, SkillMatch[]> = {}
  skills.forEach(s => { (grouped[s.group] ??= []).push(s) })

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--dim)', marginBottom: 8, letterSpacing: '0.05em' }}>
        SKILLS MATCHED ({skills.length})
      </div>
      {Object.keys(grouped).length === 0 && (
        <span style={{ color: 'var(--dim)', fontSize: '0.78rem' }}>None yet</span>
      )}
      {Object.entries(grouped).map(([group, matches]) => (
        <div key={group} style={{ marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--red)', fontWeight: 600 }}>
            {group} ({matches.length})
          </span>
          {matches.slice(0, 3).map(m => (
            <div key={m.id} style={{
              fontSize: '0.7rem', color: 'var(--dim)', fontFamily: 'monospace',
              paddingLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {m.id} <span style={{ color: 'var(--accent)' }}>({m.score}%)</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [skills, setSkills] = useState<SkillMatch[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'out') => {
    setLogs(l => [...l, { time: now(), text, type }])
  }, [])

  const updatePhase = useCallback((id: number, status: Phase['status']) => {
    setPhases(p => p.map(ph => ph.id === id ? { ...ph, status } : ph))
  }, [])

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  const run = async () => {
    setRunning(true)
    setDone(false)
    setLogs([])
    setSkills([])
    setPhases(INITIAL_PHASES.map(p => ({ ...p, status: 'pending' })))

    // Phase 0: Triage
    updatePhase(0, 'active')
    addLog('arsenal skill list', 'cmd')
    await sleep(DELAY)
    addLog('764 skills across 11 groups', 'ok')
    addLog('Target 192.168.8.51 → web target → groups: recon, web, exploit', 'info')
    updatePhase(0, 'done')

    // Phase 1: Recon
    updatePhase(1, 'active')
    addLog('arsenal recon all 192.168.8.51', 'cmd')
    await sleep(DELAY * 2)
    addLog('[subenum] ✓ 1 record', 'ok')
    addLog('[portscan] nmap -sV -T4 --top-ports 100', 'cmd')
    await sleep(DELAY * 2)
    addLog('22/tcp open ssh    OpenSSH 9.6p1 Ubuntu', 'out')
    addLog('80/tcp open http   Apache httpd 2.4.58', 'out')
    addLog('Service Info: OS: Linux', 'out')
    setSkills(s => [...s, { group: 'recon', id: 'performing-port-scanning', score: 95 }])
    addLog('[techdetect] HTTP/1.1 200 OK — Server: Apache/2.4.58', 'ok')
    addLog('HTML title: "SQLi Challenge Lab"', 'info')
    addLog('[certscan] No TLS on port 443', 'out')
    updatePhase(1, 'done')

    // Phase 2: Select
    updatePhase(2, 'active')
    addLog('arsenal skill list --search "sql injection"', 'cmd')
    await sleep(DELAY)
    addLog('8 skills matched', 'ok')
    setSkills(s => [
      ...s,
      { group: 'exploit', id: 'exploiting-sql-injection-vulnerabilities', score: 98 },
      { group: 'web', id: 'exploiting-sql-injection-with-sqlmap', score: 94 },
      { group: 'defense', id: 'detecting-sql-injection-via-waf-logs', score: 82 },
      { group: 'web', id: 'performing-second-order-sql-injection', score: 78 },
    ])
    addLog('Selected: exploiting-sql-injection-vulnerabilities (exploit, 98%)', 'info')
    await sleep(DELAY)
    addLog('arsenal skill show exploiting-sql-injection-vulnerabilities', 'cmd')
    addLog('Loading playbook: 196 lines — error-based, union, blind, time-based', 'ok')
    updatePhase(2, 'done')

    // Phase 3: Execute
    updatePhase(3, 'active')
    addLog('--- EXECUTING TIER 1: Login Bypass ---', 'info')
    addLog("curl tier1.php?user=admin&pass=' OR '1'='1", 'cmd')
    await sleep(DELAY)
    addLog('Flag: CTF{sql1_byp4ss_4uth}', 'ok')
    await sleep(DELAY / 2)
    addLog('--- EXECUTING TIER 2: UNION Extraction ---', 'info')
    addLog('curl tier2.php?id=-1 UNION SELECT ... FROM users--', 'cmd')
    await sleep(DELAY * 2)
    addLog('Dumped 5 users: admin, alice, bob, charlie, flag_holder', 'ok')
    addLog('Credit cards extracted: 4532-7891-2345-6789 ...', 'out')
    await sleep(DELAY)
    addLog('--- EXECUTING TIER 3: Boolean Blind ---', 'info')
    addLog('Extracting admin password byte by byte...', 'cmd')
    await sleep(DELAY * 3)
    addLog('Admin password: SuperS3cret!', 'ok')
    addLog('Flag: CTF{sql1_bl1nd_b00l34n}', 'ok')
    await sleep(DELAY)
    addLog('--- EXECUTING TIER 4: Time-Based Blind ---', 'info')
    addLog('Payload: IF(SUBSTRING(flag,N,1)=0x??,SLEEP(1),0)', 'cmd')
    await sleep(DELAY * 4)
    addLog('Flag: CTF{t1m3_b4s3d_bl1nd_sql1}', 'ok')
    await sleep(DELAY)
    addLog('--- EXECUTING TIER 5: Error-Based ---', 'info')
    addLog("Payload: ExtractValue(1,CONCAT(0x7e,(SELECT password...)))", 'cmd')
    await sleep(DELAY * 2)
    addLog('XPATH error leaked: ~SuperS3cret!', 'ok')
    addLog('Flag: CTF{3rr0r_b4s3d_3xtr4ct10n}', 'ok')
    setSkills(s => [
      ...s,
      { group: 'exploit', id: 'performing-privilege-escalation-on-linux', score: 91 },
    ])
    updatePhase(3, 'done')

    // Phase 4: Report
    updatePhase(4, 'active')
    addLog('Compiling findings...', 'cmd')
    await sleep(DELAY * 2)
    addLog('5/5 tiers exploited successfully', 'ok')
    addLog('Flags captured: 5', 'ok')
    addLog('Users compromised: 5 (admin, alice, bob, charlie, flag_holder)', 'out')
    addLog('Credit cards exposed: 4', 'out')
    addLog('Critical: SQL injection allows full database extraction', 'info')
    addLog('High: Authentication bypass via login form', 'info')
    addLog('Medium: Information disclosure via error messages', 'info')
    updatePhase(4, 'done')

    // Phase 5: Lateral
    updatePhase(5, 'active')
    addLog('arsenal skill list --group exploit --search "privesc"', 'cmd')
    await sleep(DELAY)
    addLog('Matched: performing-privilege-escalation-on-linux (91%)', 'info')
    addLog('Scanning adjacent hosts...', 'cmd')
    await sleep(DELAY * 2)
    addLog('Found: 192.168.8.219 (reachable)', 'out')
    addLog('Found: 192.168.8.228 (stale)', 'out')
    addLog('Found: 192.168.8.1 (gateway)', 'out')
    addLog('Internal services: MySQL 3306 (localhost only)', 'info')
    addLog('Privesc path: dev → sudo mysql → system cat /root/root.txt', 'ok')
    addLog('Root flag: CTF{sql1_l4b_c0mpl3t3}', 'ok')
    setSkills(s => [
      ...s,
      { group: 'network', id: 'performing-lateral-movement-detection', score: 87 },
      { group: 'recon', id: 'scanning-internal-network-hosts', score: 84 },
    ])
    updatePhase(5, 'done')

    setDone(true)
    setRunning(false)
    addLog('--- ATTACK COMPLETE — 6 phases, 0 failures ---', 'info')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header running={running} done={done} />

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{
          width: 220, minWidth: 220,
          background: 'var(--bg2)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column'
        }}>
          <PhasePanel phases={phases} />
          <SkillPanel skills={skills} />

          {/* Start button */}
          <div style={{ padding: '12px 16px', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
            <button onClick={run} disabled={running} style={{
              width: '100%', padding: '10px 0', borderRadius: 5,
              background: running ? 'var(--bg3)' : 'var(--red)',
              color: running ? 'var(--dim)' : '#fff',
              border: 'none', fontWeight: 700, fontSize: '0.88rem',
              cursor: running ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s'
            }}>
              {running ? 'Running...' : done ? '⟳ Replay' : '▶ Run Attack'}
            </button>
          </div>
        </div>

        {/* Activity log */}
        <div style={{ flexGrow: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
          <ActivityLog entries={logs} maxHeight={window.innerHeight - 80} />
        </div>
      </div>
    </div>
  )
}
