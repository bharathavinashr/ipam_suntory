import { useState, useEffect } from 'react';
import { BRANDS_AU_NONALC, BRANDS_AU_ALC, BRANDS_NZ_NONALC, BRANDS_NZ_ALC,
  CUSTS_NONALC, CUSTS_ALC, TIERS, STATUS_COL, PERSONAS, ALL_ROWS, bc } from '../constants';

const DEFAULT_MILESTONES = [
  { l:'Brief to Agency', d:'', done:false },
  { l:'Scamps Review', d:'', done:false },
  { l:'Finance Approval', d:'', done:false },
  { l:'POS Distribution', d:'', done:false },
  { l:'Go Live', d:'', done:false },
  { l:'13-Week Review', d:'', done:false },
];

const DEFAULT = {
  name:'', brand:'', type:'', tier:'', status:'',
  channel:'', customer:'', market:'', category:'',
  calendar_rows:['NPD1'], start_date:'', end_date:'', first_order_date:'', last_order_date:'', budget:0, store_targets:0,
  objective:'', success_criteria:'', notes:'', tags:[], personas:[],
  milestones: DEFAULT_MILESTONES, review_due: '', reviewed: false, review_score: 0,
};

// Helper function to convert month key (e.g., "jan27") to a YYYY-MM-DD date format
const getDefaultDate = (monthKey) => {
  if (!monthKey) return '';
  const mStr = monthKey.slice(0, 3).toLowerCase();
  const yStr = monthKey.slice(3, 5);
  const mNum = { 
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', 
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' 
  }[mStr];
  
  if (mNum && yStr.length === 2) {
    return `20${yStr}-${mNum}-01`; // Defaults to the 1st of the month
  }
  return '';
};

// Helper function to convert YYYY-MM-DD back to an internal month key (e.g., "jan27")
const getMonthKey = (dateString) => {
  if (!dateString) return '';
  const [yyyy, mm] = dateString.split('-');
  if (!yyyy || !mm) return '';
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `${months[parseInt(mm, 10) - 1]}${yyyy.slice(2)}`;
};

export default function FormModal({ campaignId, campaigns, onClose, onSave, defaultMonth, defaultRow }) {
  const existing = campaignId ? campaigns.find(c => c.id === campaignId) : null;
  const [tab, setTab] = useState('Overview');
  
  // Safely initialize state, guaranteeing milestones and tags exist for editing
  const getInitialState = (ext, month, row) => {
    const base = {
      ...DEFAULT,
      ...(month && {
        start_month: month, 
        end_month: month, 
        start_date: getDefaultDate(month),
        end_date: getDefaultDate(month)
      }),
      ...(row && { calendar_rows: [row] })
    };

    if (!ext) return { ...base, tags_str: '' };

    return {
      ...DEFAULT,
      ...ext,
      start_date: ext.start_date || getDefaultDate(ext.start_month) || '',
      end_date: ext.end_date || getDefaultDate(ext.end_month) || '',
      milestones: ext.milestones?.length ? ext.milestones : DEFAULT_MILESTONES,
      tags_str: ext.tags?.join(', ') || ''
    };
  };

  const [form, setForm] = useState(() => getInitialState(existing, defaultMonth, defaultRow));

  useEffect(() => {
    setForm(getInitialState(existing, defaultMonth, defaultRow));
  }, [campaignId, defaultMonth, defaultRow, existing]);

  const isNew = !existing;
  const bList = form.market === 'NZ'
    ? (form.category === 'Alc' ? BRANDS_NZ_ALC : BRANDS_NZ_NONALC)
    : (form.category === 'Alc' ? BRANDS_AU_ALC : BRANDS_AU_NONALC);
  const cList = form.category === 'Alc' ? CUSTS_ALC : CUSTS_NONALC;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const handleCatMarket = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      const bl = next.market === 'NZ'
        ? (next.category === 'Alc' ? BRANDS_NZ_ALC : BRANDS_NZ_NONALC)
        : (next.category === 'Alc' ? BRANDS_AU_ALC : BRANDS_AU_NONALC);
      if (!bl.includes(next.brand)) next.brand = bl[0];
      const cl = next.category === 'Alc' ? CUSTS_ALC : CUSTS_NONALC;
      if (!cl.includes(next.customer)) next.customer = cl[0];
      return next;
    });
  };

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const updateMilestone = (idx, field, val) => {
    setForm(f => {
      const newMs = [...f.milestones];
      newMs[idx] = { ...newMs[idx], [field]: val };
      return { ...f, milestones: newMs };
    });
  };

  // Validation rule: Start Date must be less than or equal to End Date
  const isDateInvalid = form.start_date && form.end_date && form.start_date > form.end_date;

  const handleSave = () => {
    if (!form.name.trim() || isDateInvalid) return;

    const s_month = form.start_date ? getMonthKey(form.start_date) : form.start_month;
    const e_month = form.end_date ? getMonthKey(form.end_date) : form.end_month;

    const payload = {
      ...form,
      start_month: s_month,
      end_month: e_month,
      tags: form.tags_str ? form.tags_str.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: existing?.images || [],
    };

    // Cleanup temporary UI fields
    delete payload.tags_str;

    onSave(payload, isNew);
  };

  const bcfg = bc(form.brand);
  const tc = TIERS[form.tier] || TIERS.Silver;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="form-box" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div>
            <div className="form-title">{isNew ? '➕ New Campaign' : '✏️ Edit Campaign'}</div>
            <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{isNew ? 'Complete all required fields' : 'Update and save changes'}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="preview-chip" style={{ background:bcfg.bg, border:`1px solid ${bcfg.bdr}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:bcfg.txt }}>{form.name || 'Campaign name'}</div>
              <div style={{ fontSize:8, opacity:.7, color:bcfg.txt }}>{form.brand} · {form.tier}</div>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Inner Modal Tabs */}
        <div className="detail-tabs" style={{ padding: '0 22px', flexShrink: 0 }}>
          {['Overview', 'Milestones', 'Review'].map(t => (
            <button key={t} type="button" className={`detail-tab ${tab === t ? 'active' : ''}`}
              style={tab === t ? { color: tc.acc, borderBottomColor: tc.acc } : {}}
              onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="form-body">
          {/* TAB 1: OVERVIEW */}
          {tab === 'Overview' && (
            <>
              <div className="field">
                <label>Campaign / Product Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. V AMETHYST" />
              </div>
              <div className="form-row">
                <Field label="Market">
                  <select value={form.market} onChange={e => handleCatMarket('market', e.target.value)}>
                    <option value="">-- Select --</option>
                    {['AU','NZ'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={e => handleCatMarket('category', e.target.value)}>
                    <option value="">-- Select --</option>
                    {['Non-Alc','Alc'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Brand">
                  <select value={form.brand} onChange={e => set('brand', e.target.value)}>
                    <option value="">-- Select --</option>
                    {bList.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="">-- Select --</option>
                    {['NPD','Campaign','Promotion','Retailer Programme'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Tier">
                  <select value={form.tier} onChange={e => set('tier', e.target.value)}>
                    <option value="">-- Select --</option>
                    {Object.keys(TIERS).map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="">-- Select --</option>
                    {Object.keys(STATUS_COL).map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Channel">
                  <select value={form.channel} onChange={e => set('channel', e.target.value)}>
                    <option value="">-- Select --</option>
                    {['Grocery','P&C','Route','All Channels'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Customer">
                  <select value={form.customer} onChange={e => set('customer', e.target.value)}>
                    <option value="">-- Select --</option>
                    {cList.map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Start Date">
                  <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                </Field>
                <Field label="First Order Date">
                  <input type="date" value={form.first_order_date || ''} onChange={e => set('first_order_date', e.target.value)} />
                </Field>
                <Field label="Last Order Date">
                  <input type="date" value={form.last_order_date || ''} onChange={e => set('last_order_date', e.target.value)} />
                </Field>
                <Field label="Budget ($)">
                  <input type="number" value={form.budget} onChange={e => set('budget', +e.target.value)} />
                </Field>
                <Field label="Store Targets">
                  <input type="number" value={form.store_targets} onChange={e => set('store_targets', +e.target.value)} />
                </Field>
              </div>

              {isDateInvalid && (
                <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, marginBottom: 8, fontWeight: 500 }}>
                  ⚠️ Start Date must be before or equal to End Date.
                </div>
              )}

              <div className="field">
                <label>Objective</label>
                <textarea rows={2} value={form.objective} onChange={e => set('objective', e.target.value)} />
              </div>
              <div className="field">
                <label>Success Criteria</label>
                <textarea rows={2} value={form.success_criteria} onChange={e => set('success_criteria', e.target.value)} />
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea rows={1} value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="field">
                <label>Tags (Comma Separated)</label>
                <input value={form.tags_str} onChange={e => set('tags_str', e.target.value)} placeholder="e.g. Summer, Promo, Display" />
              </div>

              <div className="field">
                <label>Personas Involved</label>
                <div className="toggle-group">
                  {PERSONAS.map(p => (
                    <button key={p.role} type="button" className={`toggle-chip ${form.personas.includes(p.role) ? 'on' : ''}`}
                      onClick={() => set('personas', toggleArr(form.personas, p.role))}>
                      {p.icon} {p.role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Calendar Rows</label>
                <div className="toggle-group">
                  {ALL_ROWS.map(r => (
                    <button key={r.k} type="button" className={`toggle-chip ${form.calendar_rows.includes(r.k) ? 'on' : ''}`}
                      onClick={() => set('calendar_rows', toggleArr(form.calendar_rows, r.k))}>
                      {r.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MILESTONES */}
          {tab === 'Milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Track the progress of key delivery dates for this campaign.</div>
              {form.milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#f9fafb', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 12, color: '#334155' }}>{m.l}</div>
                  <input type="date" value={m.d} onChange={e => updateMilestone(i, 'd', e.target.value)} 
                    style={{ width: 130, background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'Jost' }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: m.done ? '#10b981' : '#64748b' }}>
                    <input type="checkbox" checked={m.done} onChange={e => updateMilestone(i, 'done', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#10b981' }} />
                    Done
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REVIEW */}
          {tab === 'Review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Log post-campaign analytics and 13-week review scoring.</div>
              
              <Field label="Review Due Date">
                <input type="date" value={form.review_due} onChange={e => set('review_due', e.target.value)} />
              </Field>

              <div className="field">
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: form.reviewed ? '#10b981' : '#334155', textTransform: 'none' }}>
                  <input type="checkbox" checked={form.reviewed} onChange={e => set('reviewed', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#10b981' }} />
                  13-Week Review Completed
                </label>
              </div>

              {form.reviewed && (
                <Field label="Review Score (out of 5)">
                  <select value={form.review_score} onChange={e => set('review_score', parseInt(e.target.value) || 0)}>
                    {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </Field>
              )}
            </div>
          )}
        </div>

        <div className="form-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="save-btn" onClick={handleSave} disabled={!form.name.trim() || isDateInvalid}>
            {isNew ? 'Create Campaign' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}