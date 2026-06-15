import { useState } from 'react';
import { STATUS_COL, TIERS, bc, tierAcc, statusCol, fmt } from '../constants';
import { StatusBadge, TierBadge, BrandBadge, ProgressBar } from './Badges';

export default function ToolView({ campaigns, onOpenDetail, onOpenForm, canEdit }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = campaigns.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.brand.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBudget = filtered.reduce((a, c) => a + (c.budget || 0), 0);
  const published = filtered.filter(c => c.status === 'Published').length;
  const reviewed = filtered.filter(c => c.reviewed).length;

  const stats = [
    { l: 'Campaigns', v: filtered.length, c: '#60A5FA' },
    { l: 'Total Budget', v: fmt(totalBudget), c: '#FFD700' },
    { l: 'Published', v: published, c: '#06B6D4' },
    { l: 'Reviewed', v: reviewed, c: '#10B981' },
  ];

  return (
    <div id="tab-tool" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="tool-header">
        <div className="stats-row">
          {stats.map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-label">{s.l}</div>
              <div className="stat-value" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="tool-filters">
          <input className="search-input" placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="chip-group">
            {['All', ...Object.keys(STATUS_COL)].map(s => {
              const col = STATUS_COL[s] || '#3B82F6';
              const active = statusFilter === s;
              return (
                <button key={s} className={`chip ${active ? 'active' : ''}`}
                  style={active ? { background: col, borderColor: col, color: '#fff' } : {}}
                  onClick={() => setStatusFilter(s)}>{s}</button>
              );
            })}
          </div>
          <div className="spacer"></div>
          {canEdit && <button className="new-btn" onClick={() => onOpenForm(null)}>➕ New Campaign</button>}
        </div>
      </div>
      <div id="tool-wrap">
        <div className="cards-grid">
          {!filtered.length
            ? <div className="empty-state">No campaigns match your filters</div>
            : filtered.map(c => <CampaignCard key={c.id} campaign={c} onOpenDetail={onOpenDetail} onOpenForm={onOpenForm} canEdit={canEdit} />)
          }
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign: c, onOpenDetail, onOpenForm, canEdit }) {
  const tc = TIERS[c.tier] || TIERS.Silver;
  const launch = c.start_month ? c.start_month.replace(/(\d+)$/, " '$1").toUpperCase() : '';
  return (
    <div className="tool-card" style={{ borderLeftColor: tc.acc }}>
      <div style={{ position:'absolute', top:0, right:0, width:60, height:60,
        background:`radial-gradient(circle at top right,${tc.acc}08,transparent 70%)`,
        pointerEvents:'none', borderRadius:12 }}></div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:9 }}>
        <div style={{ flex:1, paddingRight:8 }}>
          <div className="card-meta">{c.id} · {c.market} · {c.category}</div>
          <div className="card-name">{c.name}</div>
          <div className="card-brand">{c.brand}</div>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="card-tags">
        <TierBadge tier={c.tier} />
        <BrandBadge brand={c.brand} />
        <span style={{ fontSize:9, color:'#64748B', alignSelf:'center' }}>{c.channel} · {c.customer}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
        <div>
          <div style={{ fontSize:7, color:'#475569', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Launch</div>
          <div style={{ fontSize:10, color:'#94A3B8' }}>{launch}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:7, color:'#475569', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Budget</div>
          <div style={{ fontSize:12, fontWeight:700, color:tc.acc }}>{fmt(c.budget)}</div>
        </div>
      </div>
      <ProgressBar milestones={c.milestones || []} tier={c.tier} />
      <div className="card-actions" style={{ marginTop:11 }}>
        <button className="view-btn" onClick={() => onOpenDetail(c)}>👁 View Details</button>
        {canEdit && <button className="edit-btn" onClick={() => onOpenForm(c.id)}>✏️ Edit</button>}
      </div>
    </div>
  );
}
