import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = { id: number; name: string; icon: string; status: 'pending' | 'active' | 'done' }
type LogEntry = { time: string; text: string; type: 'cmd' | 'out' | 'ok' | 'err' | 'info' }
type SkillMatch = { group: string; id: string; score: number }

const DELAY = 500

const INITIAL_PHASES: Phase[] = [
  { id: 0, name: 'Triage', icon: '🔍', status: 'pending' },
  { id: 1, name: 'Recon', icon: '📡', status: 'pending' },
  { id: 2, name: 'Select', icon: '🎯', status: 'pending' },
  { id: 3, name: 'Execute', icon: '⚡', status: 'pending' },
  { id: 4, name: 'Report', icon: '📋', status: 'pending' },
  { id: 5, name: 'Lateral', icon: '🔗', status: 'pending' },
]

const GROUPS = [
  { n: 'recon', c: 149 }, { n: 'defense', c: 132 }, { n: 'cloud', c: 109 },
  { n: 'web', c: 74 }, { n: 'network', c: 74 }, { n: 'identity', c: 54 },
  { n: 'specialized', c: 51 }, { n: 'exploit', c: 50 }, { n: 'malware', c: 39 },
  { n: 'vuln-mgmt', c: 25 }, { n: 'compliance', c: 7 },
]

const TOOLS = [
  { n: 'arsenal_attack', d: 'Full 5-phase attack pipeline against a target' },
  { n: 'arsenal_recon', d: 'nmap, dig, curl, openssl reconnaissance' },
  { n: 'arsenal_skill_list', d: 'Browse 764 skills across 11 groups' },
  { n: 'arsenal_skill_show', d: "Read a skill's full playbook" },
  { n: 'arsenal_skill_stats', d: 'Group → category breakdown' },
  { n: 'arsenal_lab_targets', d: 'Browse 22 vulnerable lab targets' },
  { n: 'arsenal_lab_info', d: 'Target details, flags, deploy commands' },
]

function now() { return new Date().toISOString().slice(11, 19) }

// ── Components ───────────────────────────────────────────────────────────────

function Header() {
  return (
    <nav style={navStyle}>
      <span style={logoStyle}>⚔️ arsenal <span style={{ color: 'var(--red)' }}>cli</span></span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Features','Plugin','Demo','Install'].map(s => (
          <a key={s} href={`#${s.toLowerCase()}`} style={navLinkStyle}>{s}</a>
        ))}
        <a href="https://github.com/dazeb/arsenal-cli" style={navLinkStyle}>GitHub</a>
      </div>
    </nav>
  )
}

function RedSpan({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--red)' }}>{children}</span>
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: '64px 24px', maxWidth: 960, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>
        <RedSpan>▸</RedSpan> {title}
      </h2>
      {children}
    </section>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: 20, ...style }}>
      {children}
    </div>
  )
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
      {[{ n: '764', l: 'Skills' }, { n: '11', l: 'Groups' }, { n: '40+', l: 'Categories' }, { n: '22', l: 'Lab Targets' }, { n: '7', l: 'Hermes Tools' }].map(s => (
        <Card key={s.l} style={{ textAlign: 'center', padding: '16px 12px' }}>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--red)', fontFamily: 'monospace' }}>{s.n}</div>
          <div style={{ color: 'var(--dim)', fontSize: '0.78rem', marginTop: 4 }}>{s.l}</div>
        </Card>
      ))}
    </div>
  )
}

// ── Workflow Visualizer (Demo) ───────────────────────────────────────────────
function PhasePanel({ phases }: { phases: Phase[] }) {
  return (
    <div style={{ padding: '8px 0' }}>
      {phases.map((p, i) => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
          borderBottom: i < phases.length - 1 ? '1px solid var(--border)' : 'none',
          opacity: p.status === 'pending' ? 0.4 : 1,
        }}>
          <span>{p.icon}</span>
          <span style={{ fontWeight: p.status === 'active' ? 700 : 500, fontSize: '0.82rem',
            color: p.status === 'active' ? 'var(--red)' : p.status === 'done' ? 'var(--green)' : 'var(--dim)' }}>
            {p.name}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
            {p.status === 'active' ? '◉' : p.status === 'done' ? '✓' : '○'}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActivityLog({ entries, maxH }: { entries: LogEntry[]; maxH: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight) }, [entries])

  const c = (t: LogEntry['type']) =>
    t === 'cmd' ? 'var(--green)' : t === 'ok' ? 'var(--green)' :
    t === 'err' ? 'var(--red)' : t === 'info' ? '#ff6b6b' : 'var(--dim)'

  return (
    <div ref={ref} style={{
      background: '#0d0d14', border: '1px solid var(--border)', borderRadius: 5,
      height: maxH, overflow: 'auto', padding: '10px 14px',
      fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.55,
    }}>
      {entries.length === 0 && <span style={{ color: 'var(--dim)' }}>Press Run to see the agent in action...</span>}
      {entries.map((e, i) => (
        <div key={i}>
          <span style={{ color: 'var(--dim)' }}>{e.time}</span>
          {' '}<span style={{ color: c(e.type) }}>{e.type === 'cmd' ? '$ ' : ''}{e.text}</span>
        </div>
      ))}
    </div>
  )
}

function SkillPanel({ skills }: { skills: SkillMatch[] }) {
  const grouped: Record<string, SkillMatch[]> = {}
  skills.forEach(s => { (grouped[s.group] ??= []).push(s) })
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--dim)', marginBottom: 6 }}>SKILLS ({skills.length})</div>
      {Object.keys(grouped).length === 0 && <span style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>None yet</span>}
      {Object.entries(grouped).map(([g, m]) => (
        <div key={g} style={{ marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--red)', fontWeight: 600 }}>{g} ({m.length})</span>
          {m.slice(0, 2).map(s => (
            <div key={s.id} style={{ fontSize: '0.65rem', color: 'var(--dim)', fontFamily: 'monospace', paddingLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.id} <span style={{ color: '#ff6b6b' }}>({s.score}%)</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function WorkflowDemo() {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [skills, setSkills] = useState<SkillMatch[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'out') => {
    setLogs(l => [...l, { time: now(), text, type }])
  }, [])
  const upPhase = useCallback((id: number, s: Phase['status']) => { setPhases(p => p.map(ph => ph.id === id ? { ...ph, status: s } : ph)) }, [])
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  const run = async () => {
    setRunning(true); setDone(false); setLogs([]); setSkills([])
    setPhases(INITIAL_PHASES.map(p => ({ ...p, status: 'pending' })))

    upPhase(0, 'active'); addLog('arsenal skill stats', 'cmd')
    await sleep(DELAY); addLog('764 skills across 11 groups', 'ok')
    addLog('Target 192.168.8.51 → web target → recon, web, exploit', 'info')
    upPhase(0, 'done')

    upPhase(1, 'active'); addLog('arsenal recon all 192.168.8.51', 'cmd')
    await sleep(DELAY * 2); addLog('[portscan] 22/tcp ssh, 80/tcp Apache 2.4.58', 'ok')
    addLog('[techdetect] HTML: "SQLi Challenge Lab"', 'info')
    setSkills(s => [...s, { group: 'recon', id: 'performing-port-scanning', score: 95 }])
    upPhase(1, 'done')

    upPhase(2, 'active'); addLog('arsenal skill list --search "sql injection"', 'cmd')
    await sleep(DELAY); addLog('8 skills matched', 'ok')
    setSkills(s => [...s, { group: 'exploit', id: 'exploiting-sqli-vulnerabilities', score: 98 }, { group: 'web', id: 'exploiting-sqli-with-sqlmap', score: 94 }])
    addLog('Selected: exploiting-sqli-vulnerabilities (98%)', 'info')
    addLog('arsenal skill show — reading playbook...', 'cmd')
    upPhase(2, 'done')

    upPhase(3, 'active')
    for (const t of [
      ['T1: Login Bypass', "curl ...?user=admin&pass=' OR '1'='1", 'CTF{sql1_byp4ss_4uth}'],
      ['T2: UNION Extraction', 'UNION SELECT username,password FROM users', '5 users + credit cards dumped'],
      ['T3: Boolean Blind', 'SUBSTRING(password,N,1)=char(...)', 'CTF{sql1_bl1nd_b00l34n}'],
      ['T4: Time-Based', 'IF(SUBSTRING(flag,N,1)=... ,SLEEP(1),0)', 'CTF{t1m3_b4s3d_bl1nd_sql1}'],
      ['T5: Error-Based', 'ExtractValue(1,CONCAT(0x7e,(...)))', 'CTF{3rr0r_b4s3d_3xtr4ct10n}'],
    ] as const) {
      addLog(`--- ${t[0]} ---`, 'info'); addLog(t[1], 'cmd')
      await sleep(DELAY * 2); addLog(`✓ ${t[2]}`, 'ok')
    }
    upPhase(3, 'done')

    upPhase(4, 'active'); addLog('Compiling findings...', 'cmd')
    await sleep(DELAY * 2); addLog('5/5 tiers exploited · 5 flags captured', 'ok')
    addLog('Critical: SQL injection · High: Auth bypass · Medium: Info disclosure', 'info')
    upPhase(4, 'done')

    upPhase(5, 'active'); addLog('arsenal skill list --group exploit --search privesc', 'cmd')
    await sleep(DELAY); addLog('Matched: privilege-escalation-on-linux (91%)', 'info')
    addLog('Scanning adjacent hosts...', 'cmd'); await sleep(DELAY)
    addLog('Found: 192.168.8.219 · 192.168.8.1', 'out')
    addLog('Privesc: sudo mysql → root flag captured', 'ok')
    upPhase(5, 'done'); setDone(true); setRunning(false)
  }

  return (
    <Section id="demo" title="Live Demo — Agent Workflow">
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 200, minWidth: 200, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: 12, display: 'flex', flexDirection: 'column' }}>
          <PhasePanel phases={phases} />
          <div style={{ flex: 1 }} />
          <SkillPanel skills={skills} />
          <button onClick={run} disabled={running} style={{
            width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 5,
            background: running ? 'var(--bg3)' : 'var(--red)', color: running ? 'var(--dim)' : '#fff',
            border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: running ? 'not-allowed' : 'pointer',
          }}>
            {running ? 'Running...' : done ? '⟳ Replay' : '▶ Run Attack'}
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <ActivityLog entries={logs} maxH={380} />
        </div>
      </div>
    </Section>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16 }}>
          ⚔️ Arsenal CLI
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--dim)', marginBottom: 28, lineHeight: 1.7 }}>
          An agent-driven offensive security lab. <RedSpan>764 skills</RedSpan>, <RedSpan>22 lab targets</RedSpan>, and a <RedSpan>Hermes plugin</RedSpan> with 7 tools.
          Give the agent a target — it runs recon, selects skills, executes attacks, and checks lateral movement.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/dazeb/arsenal-cli" style={btnPrimaryStyle}>⬇ GitHub</a>
          <a href="#demo" style={btnSecondaryStyle}>▶ See Demo</a>
        </div>
      </section>

      {/* Stats */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 40px' }}><StatsBar /></div>

      {/* Features */}
      <Section id="features" title="What It Does">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <Card><h3 style={{ marginBottom: 8 }}>🔍 Skill Browser</h3><p style={{ color: 'var(--dim)', fontSize: '0.88rem', lineHeight: 1.6 }}>Browse 764 skills across 11 groups. Drill down by group, category, or free-text search. Every skill is a playbook — read it, then execute it.</p></Card>
          <Card><h3 style={{ marginBottom: 8 }}>⚡ Agent-Driven Attacks</h3><p style={{ color: 'var(--dim)', fontSize: '0.88rem', lineHeight: 1.6 }}>Give the agent a target. It runs recon with real tools (nmap, dig, curl), matches skills from the catalog, executes the attack, and reports results. Lateral checks built in.</p></Card>
          <Card><h3 style={{ marginBottom: 8 }}>🧪 22 Lab Targets</h3><p style={{ color: 'var(--dim)', fontSize: '0.88rem', lineHeight: 1.6 }}>Deliberately vulnerable Docker containers and Proxmox LXC templates. SQLi, XSS, SSRF, RCE, Tomcat — practice against real attack surfaces with known flags.</p></Card>
        </div>
      </Section>

      {/* Hermes Plugin */}
      <Section id="plugin" title="Hermes Agent Plugin">
        <p style={{ color: 'var(--dim)', marginBottom: 24, lineHeight: 1.6 }}>
          Install the <RedSpan>arsenal</RedSpan> plugin into Hermes Agent and get 7 tools your agent can call directly. The <code style={codeStyle}>arsenal-agent</code> skill teaches it the 5-phase attack workflow.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
          {TOOLS.map(t => (
            <Card key={t.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: 'var(--green)', whiteSpace: 'nowrap' }}>{t.n}</span>
              <span style={{ color: 'var(--dim)', fontSize: '0.82rem', lineHeight: 1.5 }}>{t.d}</span>
            </Card>
          ))}
        </div>

        <h3 style={{ marginBottom: 12 }}>5-Phase Attack Workflow</h3>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            ['🔍 Triage', 'Classify target, pick groups'],
            ['📡 Recon', 'nmap · dig · curl · openssl'],
            ['🎯 Select', 'Browse 764 skills, match to target'],
            ['⚡ Execute', "Read playbook → run the attack"],
            ['📋 Report', 'Success/failure, flags, evidence'],
            ['🔗 Lateral', 'Privesc, adjacent hosts, pivot'],
          ].map(([h, d]) => (
            <Card key={h} style={{ flex: '1 1 140px', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{h}</div>
              <div style={{ color: 'var(--dim)', fontSize: '0.74rem' }}>{d}</div>
            </Card>
          ))}
        </div>

        <h3 style={{ marginBottom: 12 }}>Install</h3>
        <Card style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.8 }}>
          <div><span style={{ color: 'var(--green)' }}>$</span> hermes plugins install dazeb/hermes-arsenal-plugin</div>
          <div><span style={{ color: 'var(--green)' }}>$</span> hermes plugins enable arsenal</div>
          <div style={{ marginTop: 8, color: 'var(--dim)', fontSize: '0.74rem' }}>
            # Set ARSENAL_HOME in ~/.hermes/.env<br/>
            # Plugin auto-discovers tools on next session<br/>
            # Skill loads automatically: arsenal-agent
          </div>
        </Card>
      </Section>

      {/* Skill Groups */}
      <Section id="groups" title="Skill Groups">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {GROUPS.map(g => (
            <Card key={g.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.n}</span>
              <span style={{ color: 'var(--red)', fontFamily: 'monospace', fontWeight: 700 }}>{g.c}</span>
            </Card>
          ))}
        </div>
      </Section>

      {/* Live Demo */}
      <WorkflowDemo />

      {/* Install */}
      <Section id="install" title="Install">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Card>
            <h3 style={{ marginBottom: 10 }}>CLI</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.8 }}>
              <div><span style={{ color: 'var(--green)' }}>$</span> git clone https://github.com/dazeb/arsenal-cli</div>
              <div><span style={{ color: 'var(--green)' }}>$</span> cd arsenal-cli && pnpm install && pnpm build</div>
              <div><span style={{ color: 'var(--green)' }}>$</span> pnpm dev</div>
            </div>
            <p style={{ color: 'var(--dim)', fontSize: '0.78rem', marginTop: 10 }}>Node 18+ · pnpm · TypeScript · SQLite</p>
          </Card>
          <Card>
            <h3 style={{ marginBottom: 10 }}>Hermes Plugin</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.8 }}>
              <div><span style={{ color: 'var(--green)' }}>$</span> hermes plugins install dazeb/hermes-arsenal-plugin</div>
              <div><span style={{ color: 'var(--green)' }}>$</span> hermes plugins enable arsenal</div>
              <div><span style={{ color: 'var(--green)' }}>$</span> # Start new session — 7 tools available</div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['arsenal_attack','arsenal_recon','arsenal_skill_list','arsenal_skill_show','arsenal_skill_stats','arsenal_lab_targets','arsenal_lab_info'].map(t => (
                <span key={t} style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--dim)', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 3 }}>{t}</span>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--dim)', fontSize: '0.78rem', borderTop: '1px solid var(--border)' }}>
        <p>Arsenal CLI — open source under <a href="https://github.com/dazeb/arsenal-cli" style={{ color: 'var(--red)' }}>MIT license</a></p>
      </footer>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const navStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
  background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border)', padding: '12px 24px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const logoStyle: React.CSSProperties = { fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }
const navLinkStyle: React.CSSProperties = { color: 'var(--dim)', textDecoration: 'none', fontSize: '0.85rem' }
const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px',
  borderRadius: 5, background: 'var(--red)', color: '#fff', fontWeight: 600,
  textDecoration: 'none', fontSize: '0.92rem',
}
const btnSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px',
  borderRadius: 5, background: 'var(--bg2)', color: 'var(--text)',
  border: '1px solid var(--border)', fontWeight: 600, textDecoration: 'none', fontSize: '0.92rem',
}
const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: '0.82rem', background: 'var(--bg3)',
  padding: '2px 6px', borderRadius: 3, color: 'var(--green)',
}
