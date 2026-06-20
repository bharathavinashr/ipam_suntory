import { useState, useRef } from 'react';
import { PERIODS, ALL_MONTHS, ROW_GROUPS, TIERS, bc } from '../constants';

export default function CalendarView({ campaigns, filters, onOpenDetail, canEdit, onOpenForm, onSave }) {
  const market = filters.org === 'NZ' ? 'NZ' : 'AU';
  const dragRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null); // { rowKey, monthKey }

  // 1. Calculate lanes for each row.k to allow multiple campaigns to overlap seamlessly
  const rowLanes = {};
  const groupRowSpans = {};

  ROW_GROUPS.forEach((group, gi) => {
    let totalLanes = 0;
    group.rows.forEach(row => {
      // Find campaigns for this row
      const rowCamps = campaigns.filter(c => Array.isArray(c.calendar_rows) && c.calendar_rows.includes(row.k));

      // Map to start and end indices for calculating colSpan
      const items = rowCamps.map(c => {
        let si = ALL_MONTHS.findIndex(m => m.k === c.start_month);
        let ei = ALL_MONTHS.findIndex(m => m.k === c.end_month);
        if (si === -1) si = 0;
        if (ei === -1) ei = si;
        if (ei < si) ei = si; // Prevent negative spans
        return { ...c, si, ei };
      });

      // Sort by start month, then duration (longest first) to pack optimally
      items.sort((a, b) => a.si - b.si || (b.ei - b.si) - (a.ei - a.si));

      // Pack into lanes to prevent overlapping badges in the same horizontal space
      const lanes = [];
      items.forEach(item => {
        let placed = false;
        for (const lane of lanes) {
          const overlap = lane.some(existing => !(item.ei < existing.si || item.si > existing.ei));
          if (!overlap) {
            lane.push(item);
            placed = true;
            break;
          }
        }
        if (!placed) lanes.push([item]);
      });

      if (lanes.length === 0) lanes.push([]); // Ensure empty rows still render
      rowLanes[row.k] = lanes;
      totalLanes += lanes.length;
    });
    groupRowSpans[gi] = totalLanes;
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
        {canEdit && <span style={{ fontSize: 9, color: '#10B981', animation: 'pulse 2s infinite' }}>● Hover cell to add or Drag to move</span>}
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
            {ROW_GROUPS.map((group, gi) => {
              let groupLaneIdx = 0;
              return group.rows.map((row, ri) => {
                const lanes = rowLanes[row.k];
                const tierAc = TIERS[row.k]?.acc || group.col;

                return lanes.map((lane, li) => {
                  const isFirstInGroup = groupLaneIdx === 0;
                  const isFirstInRow = li === 0;
                  groupLaneIdx++;

                  // Build the cells for this specific lane
                  const cells = [];
                  let mIdx = 0;

                  while (mIdx < ALL_MONTHS.length) {
                    const camp = lane.find(c => c.si === mIdx);

                    if (camp) {
                      const span = camp.ei - camp.si + 1;
                      const mo = ALL_MONTHS[camp.si];
                      const cfg = bc(camp.brand);
                      const isDropTarget = dropTarget?.rowKey === row.k && dropTarget?.monthKey === mo.k;

                      cells.push(
                        <td
                          key={`${camp.id}-${mo.k}`}
                          colSpan={span}
                          className={`cal-cell${isDropTarget ? ' cal-drop-target' : ''}`}
                          onDragOver={canEdit ? e => e.preventDefault() : undefined}
                          onDragEnter={canEdit ? e => { e.preventDefault(); setDropTarget({ rowKey: row.k, monthKey: mo.k }); } : undefined}
                          onDrop={canEdit ? e => {
                            e.preventDefault();
                            setDropTarget(null);
                            const drag = dragRef.current;
                            if (!drag) return;
                            const { campaign, sourceRow } = drag;
                            const dragSi = ALL_MONTHS.findIndex(m => m.k === campaign.start_month);
                            const dragEi = ALL_MONTHS.findIndex(m => m.k === campaign.end_month);
                            const dragSpan = (dragEi >= 0 && dragSi >= 0) ? (dragEi - dragSi) : 0;
                            const newSi = Math.max(0, Math.min(ALL_MONTHS.length - 1 - dragSpan, camp.si));
                            const newEi = newSi + dragSpan;
                            
                            // Re-assign row gracefully if moving between tracks
                            const newRows = [...new Set(campaign.calendar_rows.map(r => r === sourceRow ? row.k : r))];
                            onSave({ ...campaign, start_month: ALL_MONTHS[newSi].k, end_month: ALL_MONTHS[newEi].k, calendar_rows: newRows }, false);
                          } : undefined}
                        >
                          <div
                            className="camp-chip"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.bdr}` }}
                            draggable={canEdit}
                            onDragStart={canEdit ? e => {
                              dragRef.current = { campaign: camp, sourceRow: row.k };
                              e.dataTransfer.effectAllowed = 'move';
                            } : undefined}
                            onDragEnd={canEdit ? () => { dragRef.current = null; setDropTarget(null); } : undefined}
                            onClick={() => onOpenDetail(camp)}>
                            <div className="camp-chip-name" style={{ color: cfg.txt }}>{camp.name}</div>
                            {(camp.fo_date || camp.ld_date) && (
                              <div className="camp-chip-detail" style={{ color: cfg.txt }}>
                                {camp.fo_date}{camp.fo_date && camp.ld_date ? ' · ' : ''}{camp.ld_date}
                              </div>
                            )}
                            <div className="camp-chip-overlay">👁</div>
                          </div>
                        </td>
                      );
                      mIdx += span;
                    } else {
                      const mo = ALL_MONTHS[mIdx];
                      const isDropTarget = dropTarget?.rowKey === row.k && dropTarget?.monthKey === mo.k;

                      cells.push(
                        <td
                          key={mo.k}
                          className={`cal-cell${isDropTarget ? ' cal-drop-target' : ''}`}
                          onDragOver={canEdit ? e => e.preventDefault() : undefined}
                          onDragEnter={canEdit ? e => { e.preventDefault(); setDropTarget({ rowKey: row.k, monthKey: mo.k }); } : undefined}
                          onDrop={canEdit ? e => {
                            e.preventDefault();
                            setDropTarget(null);
                            const drag = dragRef.current;
                            if (!drag) return;
                            const { campaign, sourceRow } = drag;
                            const dragSi = ALL_MONTHS.findIndex(m => m.k === campaign.start_month);
                            const dragEi = ALL_MONTHS.findIndex(m => m.k === campaign.end_month);
                            const dragSpan = (dragEi >= 0 && dragSi >= 0) ? (dragEi - dragSi) : 0;
                            const dropIndex = ALL_MONTHS.findIndex(m => m.k === mo.k);
                            const newSi = Math.max(0, Math.min(ALL_MONTHS.length - 1 - dragSpan, dropIndex));
                            const newEi = newSi + dragSpan;
                            
                            const newRows = [...new Set(campaign.calendar_rows.map(r => r === sourceRow ? row.k : r))];
                            onSave({ ...campaign, start_month: ALL_MONTHS[newSi].k, end_month: ALL_MONTHS[newEi].k, calendar_rows: newRows }, false);
                          } : undefined}
                        >
                          {canEdit && <div className="cal-add-cell" onClick={() => onOpenForm({ id: null, month: mo.k })}>＋</div>}
                        </td>
                      );
                      mIdx++;
                    }
                  }

                  return (
                    <tr key={`${row.k}-${li}`} className={ri % 2 === 0 ? 'cal-row-even' : 'cal-row-odd'}>
                      {isFirstInGroup && (
                        <td className="cal-section-cell" rowSpan={groupRowSpans[gi]} style={{ color: group.col }}>{group.sec}</td>
                      )}
                      {isFirstInRow && (
                        <td className="cal-row-label" rowSpan={lanes.length} style={{ color: tierAc }}>{row.l}</td>
                      )}
                      {cells}
                    </tr>
                  );
                });
              });
            })}
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