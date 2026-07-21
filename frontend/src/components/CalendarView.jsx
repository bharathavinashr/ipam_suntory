import { useState, useRef, useMemo } from 'react';
import { PERIODS, ALL_MONTHS, TIERS, bc, getCalendarLeftColumns, getCalendarRowGroups } from '../constants';
import { useAuth } from '../context/AuthContext';

// System Admin, User and Approver can move/create campaigns on the calendar; Viewer is read-only.
function canEditCalendar(role) {
  return role === 'System Admin' || role === 'User' || role === 'Approver';
}

export default function CalendarView({ campaigns, filters, onOpenDetail, onOpenForm, onSave, showWeeks }) {
  const { userRole } = useAuth();
  const canEdit = canEditCalendar(userRole);
  const market = filters.org === 'NZ' ? 'NZ' : 'AU';
  const leftColumns = getCalendarLeftColumns(market);
  const leftColumnWidths = market === 'NZ' ? [160, 240] : [160, 240, 240];
  const leftColumnOffsets = leftColumnWidths.reduce((acc, width, idx) => {
    if (idx === 0) return [0];
    return [...acc, acc[idx - 1] + leftColumnWidths[idx - 1]];
  }, []);
  const rowGroups = getCalendarRowGroups(market);
  const dragRef = useRef(null);
  
  const [dropTarget, setDropTarget] = useState(null); // { rowKey, timeKey }

  // Dynamically generate all Mondays (4 or 5 weeks) for each month
  const ALL_WEEKS = useMemo(() => {
    const monthMap = { 'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11 };
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return ALL_MONTHS.flatMap((m) => {
      // 1. Extract the year
      let y = parseInt(m.f);
      if (isNaN(y)) {
         const match = m.k.match(/\d{4}/);
         y = match ? parseInt(match[0]) : 2026;
      } else if (y < 100) {
         y += 2000;
      }

      // 2. Extract the month index safely
      let mIndex = 0;
      const searchStr = (m.k + ' ' + (m.l || '')).toLowerCase();
      for (const [key, val] of Object.entries(monthMap)) {
         if (searchStr.includes(key)) {
             mIndex = val;
             break;
         }
      }
      if (!searchStr.match(/[a-z]/)) { // Fallback for numerical formats like 2026-05
          const parts = m.k.split('-');
          if (parts.length >= 2 && !isNaN(parts[1])) mIndex = parseInt(parts[1], 10) - 1;
      }

      // 3. Find the first Monday of the month
      const d = new Date(y, mIndex, 1);
      const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const diff = day === 1 ? 0 : (day === 0 ? 1 : 8 - day);
      d.setDate(d.getDate() + diff);

      const yLabel = y.toString().slice(-2); // e.g., '26'
      const weeks = [];
      let w = 1;

      // 4. Generate all Mondays that fall within this month (will be 4 or 5)
      while (d.getMonth() === mIndex) {
        const mo = shortMonths[d.getMonth()];
        const dt = d.getDate();
        
        weeks.push({
          k: `${m.k}-W${w}`,
          monthKey: m.k,
          weekLabel: `WEEK ${w}`,
          dateLabel: `${dt}-${mo}-${yLabel}`, // Formats correctly as "3-Aug-26"
        });

        d.setDate(d.getDate() + 7);
        w++;
      }

      return weeks;
    });
  }, [ALL_MONTHS]);

  // Calculate dynamic colSpan for each month when in week view (4 or 5 weeks)
  const monthSpanMap = useMemo(() => {
    const counts = {};
    ALL_WEEKS.forEach(w => {
      counts[w.monthKey] = (counts[w.monthKey] || 0) + 1;
    });
    return counts;
  }, [ALL_WEEKS]);

  const timeColumns = showWeeks ? ALL_WEEKS : ALL_MONTHS;
  const colWidth = showWeeks ? 84 : 72; // Slightly wider for week views to fit dates

  // 1. Calculate lanes for each row.k to allow multiple campaigns to overlap seamlessly
  const rowLanes = {};
  const rowLaneCounts = {};

  rowGroups.forEach((group) => {
    group.rows.forEach(row => {
      const rowCamps = campaigns.filter(c => Array.isArray(c.calendar_rows) && c.calendar_rows.includes(row.k));

      // Map to start and end indices based on the active time scale (Months vs Weeks)
      const items = rowCamps.map(c => {
        let si, ei;
        if (showWeeks) {
          si = ALL_WEEKS.findIndex(w => w.monthKey === c.start_month);
          ei = ALL_WEEKS.findLastIndex(w => w.monthKey === c.end_month);
          if (si === -1) si = 0;
          // Dynamically span to the last week of that month if end missing
          if (ei === -1) ei = si + (monthSpanMap[c.start_month] || 4) - 1; 
        } else {
          si = ALL_MONTHS.findIndex(m => m.k === c.start_month);
          ei = ALL_MONTHS.findIndex(m => m.k === c.end_month);
          if (si === -1) si = 0;
          if (ei === -1) ei = si;
        }
        
        if (ei < si) ei = si; // Prevent negative spans
        return { ...c, si, ei };
      });

      items.sort((a, b) => a.si - b.si || (b.ei - b.si) - (a.ei - a.si));

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

      const hasEntries = lanes.length > 0;
      if (lanes.length === 0) lanes.push([]); 
      if (canEdit && hasEntries) lanes.push([]);

      rowLanes[row.k] = lanes;
      rowLaneCounts[row.k] = lanes.length;
    });
  });

  const flattenedRows = rowGroups.flatMap(group => group.rows.map(row => ({ group, row })));
  const sectionRowSpan = {};
  const categoryRowSpan = {};

  let index = 0;
  while (index < flattenedRows.length) {
    const { group, row } = flattenedRows[index];
    const sectionKey = row.section || group.sec;
    let span = 0;
    let nextIndex = index;
    while (nextIndex < flattenedRows.length) {
      const nextRow = flattenedRows[nextIndex].row;
      const nextSectionKey = nextRow.section || flattenedRows[nextIndex].group.sec;
      if (nextSectionKey !== sectionKey) break;
      span += rowLaneCounts[nextRow.k] || 1;
      nextIndex += 1;
    }
    sectionRowSpan[row.k] = span;

    if (market === 'AU') {
      let categoryIndex = index;
      while (categoryIndex < nextIndex) {
        const categoryKey = flattenedRows[categoryIndex].row.categoryOrChannel || '';
        let categorySpan = 0;
        let nextCategoryIndex = categoryIndex;
        while (nextCategoryIndex < nextIndex && (flattenedRows[nextCategoryIndex].row.categoryOrChannel || '') === categoryKey) {
          categorySpan += rowLaneCounts[flattenedRows[nextCategoryIndex].row.k] || 1;
          nextCategoryIndex += 1;
        }
        categoryRowSpan[flattenedRows[categoryIndex].row.k] = categorySpan;
        categoryIndex = nextCategoryIndex;
      }
    }
    index = nextIndex;
  }

  return (
    <div id="tab-calendar" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div id="cal-wrap" style={{ flex: 1, overflow: 'auto' }}>
        <table className="cal-table">
          <colgroup>
            {leftColumnWidths.map((width, idx) => (
              <col key={`left-col-${idx}`} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }} />
            ))}
            {timeColumns.map(tc => (
              <col key={`time-col-${tc.k}`} style={{ width: `${colWidth}px`, minWidth: `${colWidth}px`, maxWidth: `${colWidth}px` }} />
            ))}
          </colgroup>
          <thead>
            {/* Row 1: Quarters */}
            <tr>
              {leftColumns.map((col, idx) => (
                <th key={`${col.key}-q`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6' }}></th>
              ))}
              {PERIODS.map(p => {
                // Calculate dynamic quarter span based on how many weeks its months actually have
                const qSpan = showWeeks 
                  ? p.months.reduce((sum, m) => sum + (monthSpanMap[m.k] || 4), 0)
                  : p.months.length;
                return (
                  <th key={p.q} className="cal-th-q" colSpan={qSpan}>
                    {p.q}
                  </th>
                );
              })}
            </tr>
            
            {/* Row 2: Months */}
            <tr>
              {leftColumns.map((col, idx) => (
                <th key={`${col.key}-header`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6' }}>
                  {!showWeeks ? col.label : ''} 
                </th>
              ))}
              {ALL_MONTHS.map(m => (
                <th 
                  key={m.k} 
                  className="cal-th-month" 
                  colSpan={showWeeks ? (monthSpanMap[m.k] || 4) : 1}
                >
                  {m.l}<small>{m.f}</small>
                </th>
              ))}
            </tr>

            {/* Row 3 & 4: Weeks and Dates (Rendered only when toggled) */}
            {showWeeks && (
              <>
                <tr>
                  {leftColumns.map((col, idx) => (
                    <th key={`${col.key}-h-w`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6' }}>
                      {col.label}
                    </th>
                  ))}
                  {ALL_WEEKS.map(w => (
                    <th key={w.k} style={{ textAlign: 'center', background: '#f8fafc', color: '#374151', fontSize: '11px', fontWeight: 'bold', border: '1px solid #e5e7eb', padding: '4px' }}>
                      {w.weekLabel}
                    </th>
                  ))}
                </tr>
                <tr>
                  {leftColumns.map((col, idx) => (
                    <th key={`${col.key}-h-d`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6' }}></th>
                  ))}
                  {ALL_WEEKS.map(w => (
                    <th key={`${w.k}-date`} style={{ textAlign: 'center', background: '#ffffff', color: '#6b7280', fontSize: '11px', fontWeight: '600', border: '1px solid #e5e7eb', padding: '6px' }}>
                      {w.dateLabel}
                    </th>
                  ))}
                </tr>
              </>
            )}
          </thead>
          <tbody>
            {rowGroups.map((group) => {
              return group.rows.map((row, rowIndex) => {
                const lanes = rowLanes[row.k];
                const prevRow = group.rows[rowIndex - 1];
                const sectionLabelCell = !prevRow || prevRow.section !== row.section ? sectionRowSpan[row.k] : 0;
                const categoryLabelCell = market === 'AU' && (!prevRow || prevRow.section !== row.section || prevRow.categoryOrChannel !== row.categoryOrChannel)
                  ? categoryRowSpan[row.k] || 0
                  : 0;
                
                const tierKey = Object.keys(TIERS).find(k => k.toUpperCase() === row.k.toUpperCase());
                const tierConfig = tierKey ? TIERS[tierKey] : null;

                return lanes.map((lane, li) => {
                  const isPrimaryLane = li === 0;
                  const cells = [];
                  let mIdx = 0;

                  while (mIdx < timeColumns.length) {
                    const camp = lane.find(c => c.si === mIdx);

                    if (camp) {
                      const span = camp.ei - camp.si + 1;
                      const timeUnit = timeColumns[camp.si];
                      const cfg = bc(camp.brand);
                      const isDropTarget = dropTarget?.rowKey === row.k && dropTarget?.timeKey === timeUnit.k;

                      cells.push(
                        <td
                          key={`${camp.id}-${timeUnit.k}`}
                          colSpan={span}
                          className={`cal-cell${isDropTarget ? ' cal-drop-target' : ''}`}
                          onDragOver={canEdit ? e => e.preventDefault() : undefined}
                          onDragEnter={canEdit ? e => { e.preventDefault(); setDropTarget({ rowKey: row.k, timeKey: timeUnit.k }); } : undefined}
                          onDrop={canEdit ? e => {
                            e.preventDefault();
                            setDropTarget(null);
                            const drag = dragRef.current;
                            if (!drag) return;
                            const { campaign, sourceRow } = drag;
                            
                            // Calculate dropped offsets correctly matching timescale
                            const dragSi = timeColumns.findIndex(tc => (showWeeks ? tc.monthKey : tc.k) === campaign.start_month);
                            const dragEi = showWeeks 
                              ? timeColumns.findLastIndex(tc => tc.monthKey === campaign.end_month) 
                              : timeColumns.findIndex(tc => tc.k === campaign.end_month);
                            
                            const dragSpan = (dragEi >= 0 && dragSi >= 0) ? (dragEi - dragSi) : 0;
                            const newSi = Math.max(0, Math.min(timeColumns.length - 1 - dragSpan, camp.si));
                            const newEi = newSi + dragSpan;
                            
                            // Map resolved timescale index back to month keys to persist accurately
                            const saveStartMonth = showWeeks ? timeColumns[newSi].monthKey : timeColumns[newSi].k;
                            const saveEndMonth = showWeeks ? timeColumns[newEi].monthKey : timeColumns[newEi].k;

                            const newRows = [...new Set(campaign.calendar_rows.map(r => r === sourceRow ? row.k : r))];
                            onSave({ ...campaign, start_month: saveStartMonth, end_month: saveEndMonth, calendar_rows: newRows }, false);
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
                            {(camp.start_date || camp.end_date) && (
                              <div className="camp-chip-detail" style={{ color: cfg.txt }}>
                                {camp.start_date}{camp.start_date && camp.end_date ? ' · ' : ''}{camp.end_date}
                              </div>
                            )}
                            <div className="camp-chip-overlay">👁</div>
                          </div>
                        </td>
                      );
                      mIdx += span;
                    } else {
                      const timeUnit = timeColumns[mIdx];
                      const isDropTarget = dropTarget?.rowKey === row.k && dropTarget?.timeKey === timeUnit.k;
                      // Fallback to monthKey if dealing with weeks (for the form mapping)
                      const formMonthKey = showWeeks ? timeUnit.monthKey : timeUnit.k;

                      cells.push(
                        <td
                          key={timeUnit.k}
                          className={`cal-cell${isDropTarget ? ' cal-drop-target' : ''}`}
                          onDragOver={canEdit ? e => e.preventDefault() : undefined}
                          onDragEnter={canEdit ? e => { e.preventDefault(); setDropTarget({ rowKey: row.k, timeKey: timeUnit.k }); } : undefined}
                          onDrop={canEdit ? e => {
                            e.preventDefault();
                            setDropTarget(null);
                            const drag = dragRef.current;
                            if (!drag) return;
                            const { campaign, sourceRow } = drag;
                            
                            const dragSi = timeColumns.findIndex(tc => (showWeeks ? tc.monthKey : tc.k) === campaign.start_month);
                            const dragEi = showWeeks 
                              ? timeColumns.findLastIndex(tc => tc.monthKey === campaign.end_month)
                              : timeColumns.findIndex(tc => tc.k === campaign.end_month);
                            
                            const dragSpan = (dragEi >= 0 && dragSi >= 0) ? (dragEi - dragSi) : 0;
                            const dropIndex = timeColumns.findIndex(tc => tc.k === timeUnit.k);
                            const newSi = Math.max(0, Math.min(timeColumns.length - 1 - dragSpan, dropIndex));
                            const newEi = newSi + dragSpan;
                            
                            const saveStartMonth = showWeeks ? timeColumns[newSi].monthKey : timeColumns[newSi].k;
                            const saveEndMonth = showWeeks ? timeColumns[newEi].monthKey : timeColumns[newEi].k;

                            const newRows = [...new Set(campaign.calendar_rows.map(r => r === sourceRow ? row.k : r))];
                            onSave({ ...campaign, start_month: saveStartMonth, end_month: saveEndMonth, calendar_rows: newRows }, false);
                          } : undefined}
                        >
                          {canEdit && <div className="cal-add-cell" onClick={() => onOpenForm({ id: null, month: formMonthKey, rowKey: row.k })}>＋</div>}
                        </td>
                      );
                      mIdx++;
                    }
                  }

                  return (
                    <tr key={`${row.k}-${li}`} className={rowIndex % 2 === 0 ? 'cal-row-even' : 'cal-row-odd'}>
                      {leftColumns.map((col, idx) => {
                        let value = '';
                        let rowSpan = 1;
                        let renderCell = true;
                        const isFirstLane = li === 0;
                        const rowDetailRowSpan = leftColumns.some(c => c.key === 'rowDetail') ? rowLaneCounts[row.k] || 1 : 1;

                        if (col.key === 'section') {
                          value = row.section || group.sec;
                          rowSpan = sectionLabelCell || 1;
                          renderCell = isFirstLane && sectionLabelCell > 0;
                        }
                        if (col.key === 'categoryOrChannel') {
                          value = row.categoryOrChannel || '';
                          rowSpan = categoryLabelCell > 0 ? categoryRowSpan[row.k] : 1;
                          renderCell = isFirstLane && categoryLabelCell > 0;
                        }
                        if (col.key === 'rowDetail') {
                          value = row.rowDetail || row.l || '';
                          rowSpan = isFirstLane ? rowDetailRowSpan : undefined;
                          renderCell = isFirstLane;
                        }

                        if (!renderCell) return null;

                        return (
                          <td
                            key={`${row.k}-${col.key}`}
                            className="cal-left-cell"
                            rowSpan={rowSpan}
                            style={{
                              position: 'sticky',
                              left: leftColumnOffsets[idx],
                              zIndex: 2,
                              background: rowIndex % 2 === 0 ? '#ffffff' : '#fafafa',
                              width: leftColumnWidths[idx],
                              minWidth: leftColumnWidths[idx],
                              maxWidth: leftColumnWidths[idx],
                              whiteSpace: 'nowrap',
                              borderTop: (col.key === 'section' ? sectionLabelCell > 0 : categoryLabelCell > 0) ? '1px solid #e5e7eb' : '1px solid transparent',
                              fontWeight: (col.key === 'section' ? sectionLabelCell > 0 : (col.key === 'categoryOrChannel' ? categoryLabelCell > 0 : true)) ? 700 : 500,
                            }}
                          >
                            {col.key === 'rowDetail' && tierConfig ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span>{value}</span>
                                <span title={`Tier Weight: ${tierConfig.w}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280', fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>i</span>
                              </div>
                            ) : value}
                          </td>
                        );
                      })}
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
        <div className="spacer"></div>
        <span style={{ fontSize: 8, color: '#1E293B' }}>budmp_sbfo_dev.data_science.{market.toLowerCase()}_iap_calendar</span>
      </div>
    </div>
  );
}