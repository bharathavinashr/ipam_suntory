import { bc, tierAcc, statusCol, TIERS } from '../constants';

export function StatusBadge({ status }) {
  const c = statusCol(status);
  return (
    <span className="status-badge" style={{ background: `${c}18`, border: `1px solid ${c}44`, color: c }}>
      <span className="status-dot" style={{ background: c }}></span>
      {status}
    </span>
  );
}

export function TierBadge({ tier }) {
  const c = tierAcc(tier);
  return (
    <span className="tier-badge" style={{ background: `${c}20`, border: `1px solid ${c}44`, color: c }}>
      ◆ {tier}
    </span>
  );
}

export function BrandBadge({ brand }) {
  const cfg = bc(brand);
  return (
    <span className="brand-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.bdr}`, color: cfg.txt }}>
      {brand}
    </span>
  );
}

export function ProgressBar({ milestones, tier }) {
  const done = milestones.filter(m => m.done).length;
  const pct = milestones.length ? Math.round(done / milestones.length * 100) : 0;
  const acc = tierAcc(tier);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 7, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em' }}>Milestone Progress</span>
        <span style={{ fontSize: 7, color: '#64748B' }}>{done}/{milestones.length}</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${acc},${acc}88)` }}></div>
      </div>
    </div>
  );
}
