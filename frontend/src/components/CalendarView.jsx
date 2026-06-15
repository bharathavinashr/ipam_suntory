import { PERIODS, ALL_MONTHS, ROW_GROUPS, TIERS, bc, tierAcc } from '../constants';

export default function CalendarView({ campaigns, filters, onOpenDetail, canEdit, onOpenForm }) {
  const market = filters.org === 'NZ' ? 'NZ' : 'AU';

  // Build cell map: row -> month -> campaign
  const calData = {};
  campaigns.forEach(c => {
    if (!Array.isArray(c.calendar_rows)) return;
    const si = ALL_MONTHS.findIndex(m => m.k === c.start_month);
    const ei = ALL_MONTHS.findIndex(m => m.k === c.end_month);
    c.calendar_rows.forEach(row => {
      if (!calData[row]) calData[row] = {};
      for (let i = Math.max(0, si); i <= Math.min(ALL_MONTHS.length - 1, ei); i++) {
        if (!calData[row][ALL_MONTHS[i].k]) calData[row][ALL_MONTHS[i].k] = c;
      }
    });
  });

  return (
    <div id="tab-calendar" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div id="cal-info">
        <span style={{ fontSize: 10, color: '#4A1D7A', fontWeight: 800 }}>◆</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#C084FC' }}>Suntory Oceania</span>
        <span style={{ fontSize: 9, color: '#334155' }}> · Alc &amp; Non-Alc · </span>
        <span style={{ fontSize: 9, color: '#60A5FA', fontWeight: 700 }}>{market}</span>
        <span style={{ fontSize: 9, color: '#334155' }}> · Q2 2026 → Q3 2027</span>
        <div className="spacer"></div>
        {canEdit && <span style={{ fontSize: 9, color: '#10B981', animation: 'pulse 2s infinite' }}>● Hover cell to add</span>}
      </div>
      <div id="cal-wrap">
        <table className="cal-table">
          <thead>
            <tr>
              <th className="cal-th-section"></th>
              <th className="cal-th-section"></th>
              {PERIODS.map(p => <th key={p.q} className="cal-th-q" colSpan={p.months.length}>{p.q}</th>)}
            </tr>
            <tr>
              <th className="cal-th-section">SECTION</th>
              <th className="cal-th-section">ROW</th>
              {ALL_MONTHS.map(m => (
                <th key={m.k} className="cal-th-month">{m.l}<small>{m.f}</small></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_GROUPS.map(group =>
              group.rows.map((row, ri) => {
                const tierAc = TIERS[row.k]?.acc || group.col;
                return (
                  <tr key={row.k} className={ri % 2 === 0 ? 'cal-row-even' : 'cal-row-odd'}>
                    {ri === 0 && (
                      <td className="cal-section-cell" rowSpan={group.rows.length} style={{ color: group.col }}>{group.sec}</td>
                    )}
                    <td className="cal-row-label" style={{ color: tierAc }}>{row.l}</td>
                    {ALL_MONTHS.map(mo => {
                      const camp = calData[row.k]?.[mo.k];
                      const cfg = camp ? bc(camp.brand) : null;
                      return (
                        <td key={mo.k} className="cal-cell">
                          {camp ? (
                            <div className="camp-chip"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.bdr}` }}
                              onClick={() => onOpenDetail(camp)}>
                              <div className="camp-chip-name" style={{ color: cfg.txt }}>{camp.name}</div>
                              {(camp.fo_date || camp.ld_date) && (
                                <div className="camp-chip-detail" style={{ color: cfg.txt }}>
                                  {camp.fo_date}{camp.fo_date && camp.ld_date ? ' · ' : ''}{camp.ld_date}
                                </div>
                              )}
                              <div className="camp-chip-overlay">👁</div>
                            </div>
                          ) : canEdit ? (
                            <div className="cal-add-cell" onClick={() => onOpenForm(null)}>＋</div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="cal-legend">
        <span className="txt-muted">Tier Weights</span>
        {Object.entries(TIERS).map(([t, cfg]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="tier-dot" style={{ background: cfg.acc }}></div>
            <span style={{ fontSize: 8, color: cfg.acc, fontWeight: 700 }}>{t}</span>
            <span style={{ fontSize: 8, color: '#334155' }}>{cfg.w}</span>
          </div>
        ))}
        <div className="spacer"></div>
        <span style={{ fontSize: 8, color: '#1E293B' }}>budmp_sbfo_dev.data_science.{market.toLowerCase()}_iap_calendar</span>
      </div>
    </div>
  );
}
