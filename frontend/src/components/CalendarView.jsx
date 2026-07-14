import { useState, useRef } from 'react';
import { PERIODS, ALL_MONTHS, TIERS, bc, getCalendarLeftColumns, getCalendarRowGroups } from '../constants';

export default function CalendarView({ campaigns, filters, onOpenDetail, canEdit, onOpenForm, onSave }) {
  const market = filters.org === 'NZ' ? 'NZ' : 'AU';
  const leftColumns = getCalendarLeftColumns(market);
  const leftColumnWidths = market === 'NZ' ? [160, 240] : [160, 240, 240];
  const leftColumnOffsets = leftColumnWidths.reduce((acc, width, idx) => {
    if (idx === 0) return [0];
    return [...acc, acc[idx - 1] + leftColumnWidths[idx - 1]];
  }, []);
  const rowGroups = getCalendarRowGroups(market);
  const dragRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null); // { rowKey, monthKey }

  // 1. Calculate lanes for each row.k to allow multiple campaigns to overlap seamlessly
  const rowLanes = {};
  const rowLaneCounts = {};

  rowGroups.forEach((group) => {
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

      const hasEntries = lanes.length > 0;

      if (lanes.length === 0) {
        lanes.push([]); // Ensure empty rows still render
      }

      // Add an extra empty lane if editing is ON and the row already has entries
      if (canEdit && hasEntries) {
        lanes.push([]);
      }

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
      <div id="cal-wrap">
        <table className="cal-table">
          <colgroup>
            {leftColumnWidths.map((width, idx) => (
              <col key={`left-col-${idx}`} style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }} />
            ))}
            {ALL_MONTHS.map(m => (
              <col key={`month-col-${m.k}`} style={{ width: '72px', minWidth: '72px', maxWidth: '72px' }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {leftColumns.map((col, idx) => (
                <th key={`${col.key}-q`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6', width: leftColumnWidths[idx], minWidth: leftColumnWidths[idx], maxWidth: leftColumnWidths[idx] }}></th>
              ))}
              {PERIODS.map(p => <th key={p.q} className="cal-th-q" colSpan={p.months.length}>{p.q}</th>)}
            </tr>
            <tr>
              {leftColumns.map((col, idx) => (
                <th key={`${col.key}-header`} className="cal-th-section" style={{ position: 'sticky', left: leftColumnOffsets[idx], zIndex: 4 + idx, background: '#f3f4f6', width: leftColumnWidths[idx], minWidth: leftColumnWidths[idx], maxWidth: leftColumnWidths[idx] }}>{col.label}</th>
              ))}
              {ALL_MONTHS.map(m => (
                <th key={m.k} className="cal-th-month">{m.l}<small>{m.f}</small></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowGroups.map((group) => {
              return group.rows.map((row, rowIndex) => {
                const lanes = rowLanes[row.k];
                const prevRow = group.rows[rowIndex - 1];
                const sectionKey = row.section || group.sec;
                const sectionLabelCell = !prevRow || prevRow.section !== row.section ? sectionRowSpan[row.k] : 0;
                const categoryLabelCell = market === 'AU' && (!prevRow || prevRow.section !== row.section || prevRow.categoryOrChannel !== row.categoryOrChannel)
                  ? categoryRowSpan[row.k] || 0
                  : 0;
                
                // Determine if this row corresponds to a Tier to show the weight tooltip
                const tierKey = Object.keys(TIERS).find(k => k.toUpperCase() === row.k.toUpperCase());
                const tierConfig = tierKey ? TIERS[tierKey] : null;

                return lanes.map((lane, li) => {
                  const isPrimaryLane = li === 0;

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
                          {/* PASS THE rowKey HERE SO WE KNOW WHICH ROW WAS CLICKED */}
                          {canEdit && <div className="cal-add-cell" onClick={() => onOpenForm({ id: null, month: mo.k, rowKey: row.k })}>＋</div>}
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

                        if (!renderCell) {
                          return null;
                        }

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
                                <span 
                                  title={`Tier Weight: ${tierConfig.w}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    color: '#6b7280',
                                    fontSize: 10,
                                    fontWeight: 'normal',
                                    fontStyle: 'italic',
                                    fontFamily: 'serif',
                                    textTransform: 'none',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                  }}
                                >
                                  i
                                </span>
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