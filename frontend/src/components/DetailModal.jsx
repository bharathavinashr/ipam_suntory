import { useState } from 'react';
import { TIERS, PERSONAS, bc, tierAcc, fmt } from '../constants';
import { StatusBadge, TierBadge, BrandBadge } from './Badges';

export default function DetailModal({ campaign: c, onClose, onEdit, canEdit }) {
  const [tab, setTab] = useState('overview');
  if (!c) return null;

  const tc = TIERS[c.tier] || TIERS.Silver;
  const bcfg = bc(c.brand);
  const milestones = c.milestones || [];
  const done = milestones.filter(m => m.done).length;
  const pct = milestones.length ? Math.round(done / milestones.length * 100) : 0;
  const launch = c.start_month ? c.start_month.replace(/(\d+)$/, " '$1").toUpperCase() : '';

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ '--tier-accent': tc.acc, border: `1px solid ${tc.acc}33`, boxShadow: `0 60px 120px rgba(0,0,0,.95),0 0 0 1px ${tc.acc}18` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="detail-header" style={{ background: `linear-gradient(135deg,${bcfg.bg}50,transparent 60%)` }}>
          <div className="detail-close">
            {canEdit && (
              <button className="close-btn" style={{ background:'#1E3A5F', border:'1px solid #1D4ED8', color:'#60A5FA', width:'auto', padding:'0 13px', fontSize:11, fontWeight:700 }}
                onClick={() => { onEdit(c.id); onClose(); }}>✏️ Edit</button>
            )}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            <span style={{ fontSize:9, color:'#475569', fontWeight:700 }}>{c.id}</span>
            <TierBadge tier={c.tier} />
            <BrandBadge brand={c.brand} />
            <StatusBadge status={c.status} />
            <span style={{ background:'#0A1020', border:'1px solid #1E293B', borderRadius:4, padding:'1px 7px', fontSize:9, color:'#475569' }}>{c.category}</span>
          </div>
          <div className="detail-name">{c.name}</div>
          <div className="detail-sub">{c.type} · {c.channel} · {c.customer} · {c.market}</div>
          <div className="kpi-row">
            <KPI label="Budget" value={fmt(c.budget)} color={tc.acc} />
            <KPI label="Stores" value={(c.store_targets || 0).toLocaleString()} color="#94A3B8" />
            <KPI label="Launch" value={launch} color="#60A5FA" />
            <KPI label="Review Due" value={c.review_due || 'TBC'} color={c.reviewed ? '#10B981' : '#F59E0B'} />
            <KPI label="Progress" value={`${pct}%`} color="#A78BFA" />
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          {['overview', 'milestones', 'review'].map(t => (
            <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`}
              style={tab === t ? { color: tc.acc, borderBottomColor: tc.acc } : {}}
              onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Body */}
        <div className="detail-body">
          {tab === 'overview' && <OverviewTab c={c} canEdit={canEdit} tc={tc} />}
          {tab === 'milestones' && <MilestonesTab milestones={milestones} done={done} pct={pct} tc={tc} />}
          {tab === 'review' && <ReviewTab c={c} />}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color }) {
  return (
    <div className="kpi-item">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
    </div>
  );
}

function OverviewTab({ c, canEdit, tc }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Section label="Objective"><div className="content-box">{c.objective}</div></Section>
      <Section label="Success Criteria"><div className="content-box">{c.success_criteria}</div></Section>
      <Section label="Personas Involved">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {(c.personas || []).length === 0
            ? <span style={{ color:'#475569', fontSize:11, fontStyle:'italic' }}>No personas assigned.</span>
            : (c.personas || []).map(pr => {
                const p = PERSONAS.find(x => x.role === pr);
                if (!p) return null;
                return (
                  <div key={pr} className="persona-card" style={{ border:`1px solid ${p.color}33` }}>
                    <div className="persona-icon" style={{ background:`${p.color}22` }}>{p.icon}</div>
                    <div style={{ flex:1 }}>
                      <div className="persona-role" style={{ color:p.color }}>{p.role}</div>
                      <div className="persona-desc">{p.desc}</div>
                    </div>
                    <span className="access-badge" style={{ background:`${p.color}22`, color:p.color }}>{p.access}</span>
                  </div>
                );
              })
          }
        </div>
      </Section>
      <div className="grid-2">
        <div className="mini-card">
          <div className="section-label">Analytics Tier Weight</div>
          <div style={{ fontSize:28, fontWeight:800, color:tc.acc, fontFamily:"'Syne',sans-serif" }}>
            {(({ Platinum:1000, Gold:700, Silver:300, Bronze:50 })[c.tier] || 300).toLocaleString()}
          </div>
          <div style={{ fontSize:9, color:'#475569', marginTop:2 }}>{c.tier} · au_iap_calendar</div>
        </div>
        <div className="mini-card">
          <div className="section-label">Tags</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {(c.tags || []).map(t => (
              <span key={t} style={{ background:'#1E293B', border:'1px solid #334155', color:'#94A3B8', borderRadius:5, padding:'2px 8px', fontSize:10 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      {c.notes && <div className="notes-box">{c.notes}</div>}
    </div>
  );
}

function MilestonesTab({ milestones, done, pct, tc }) {
  return (
    <div>
      <div className="section-label">Campaign Milestones</div>
      <div className="milestone-line">
        {milestones.map((m, i) => (
          <div key={i} className="milestone-item">
            <div className={`milestone-dot ${m.done ? 'done' : 'todo'}`}>{m.done ? '✓' : ''}</div>
            <div className="milestone-content">
              <div className="milestone-label" style={{ color: m.done ? '#E2E8F0' : '#64748B' }}>{m.l}</div>
              <div className="milestone-date">{m.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mini-card" style={{ marginTop:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:10, color:'#475569' }}>Progress</span>
          <span style={{ fontSize:10, color:'#94A3B8' }}>{done}/{milestones.length}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${tc.acc},${tc.acc}88)` }}></div>
        </div>
      </div>
    </div>
  );
}

function ReviewTab({ c }) {
  if (c.reviewed) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', gap:5, marginBottom:4 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`star ${s <= c.review_score ? 'filled' : 'empty'}`}>{s <= c.review_score ? '★' : '☆'}</span>
          ))}
          <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>{c.review_score}/5 · 13-Week Review</span>
        </div>
        <div className="mini-card">
          <div style={{ fontSize:11, color:'#10B981', fontWeight:700 }}>✓ Review completed · {c.review_due}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="review-empty">
      <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
      <div style={{ fontSize:13, fontWeight:600, color:'#64748B', marginBottom:5 }}>Review Not Yet Completed</div>
      <div style={{ fontSize:10, color:'#475569' }}>Due: {c.review_due}</div>
    </div>
  );
}

function Section({ label, children }) {
  return <div><div className="section-label">{label}</div>{children}</div>;
}
