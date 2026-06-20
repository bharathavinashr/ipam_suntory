import { useState, useEffect } from 'react';
import { BRANDS_AU_NONALC, BRANDS_AU_ALC, BRANDS_NZ_NONALC, BRANDS_NZ_ALC,
  CUSTS_NONALC, CUSTS_ALC, TIERS, STATUS_COL, PERSONAS, ALL_ROWS, bc } from '../constants';

const DEFAULT = {
  name:'', brand:'V Energy', type:'NPD', tier:'Platinum', status:'Draft',
  channel:'Grocery', customer:'Woolworths Supermarket', market:'AU', category:'Non-Alc',
  calendar_rows:['NPD1'], fo_date:'', ld_date:'', budget:0, store_targets:0,
  objective:'', success_criteria:'', notes:'', tags:[], personas:[],
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

export default function FormModal({ campaignId, campaigns, onClose, onSave, defaultMonth }) {
  const existing = campaignId ? campaigns.find(c => c.id === campaignId) : null;
  
  const base = defaultMonth 
    ? { 
        ...DEFAULT, 
        start_month: defaultMonth, 
        end_month: defaultMonth, 
        fo_date: getDefaultDate(defaultMonth),
        ld_date: getDefaultDate(defaultMonth)
      } 
    : DEFAULT;
    
  const [form, setForm] = useState(existing || base);

  useEffect(() => {
    const b = defaultMonth 
      ? { 
          ...DEFAULT, 
          start_month: defaultMonth, 
          end_month: defaultMonth, 
          fo_date: getDefaultDate(defaultMonth),
          ld_date: getDefaultDate(defaultMonth)
        } 
      : DEFAULT;
    setForm(existing || b);
  }, [campaignId, defaultMonth, existing]);

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

  // Validation rule: FO Date must be less than or equal to LD Date
  const isDateInvalid = form.fo_date && form.ld_date && form.fo_date > form.ld_date;

  const handleSave = () => {
    if (!form.name.trim() || isDateInvalid) return;

    // Dynamically calculate the span of months based on the calendar dates selected
    const s_month = form.fo_date ? getMonthKey(form.fo_date) : form.start_month;
    const e_month = form.ld_date ? getMonthKey(form.ld_date) : form.end_month;

    const payload = {
      ...form,
      start_month: s_month,
      end_month: e_month,
      milestones: existing?.milestones || [
        { l:'Brief to Agency', d:'', done:false },
        { l:'Scamps Review', d:'', done:false },
        { l:'Finance Approval', d:'', done:false },
        { l:'POS Distribution', d:'', done:false },
        { l:'Go Live', d:'', done:false },
        { l:'13-Week Review', d:'', done:false },
      ],
      images: existing?.images || [],
      review_due: existing?.review_due || 'TBC',
      reviewed: existing?.reviewed || false,
      review_score: existing?.review_score || null,
    };
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

        <div className="form-body">
          <div className="field">
            <label>Campaign / Product Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. V AMETHYST" />
          </div>
          <div className="form-row">
            <Field label="Market">
              <select value={form.market} onChange={e => handleCatMarket('market', e.target.value)}>
                {['AU','NZ'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => handleCatMarket('category', e.target.value)}>
                {['Non-Alc','Alc'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <select value={form.brand} onChange={e => set('brand', e.target.value)}>
                {bList.map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                {['NPD','Campaign','Promotion','Retailer Programme'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Tier">
              <select value={form.tier} onChange={e => set('tier', e.target.value)}>
                {Object.keys(TIERS).map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.keys(STATUS_COL).map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Channel">
              <select value={form.channel} onChange={e => set('channel', e.target.value)}>
                {['Grocery','P&C','Route','All Channels'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Customer">
              <select value={form.customer} onChange={e => set('customer', e.target.value)}>
                {cList.map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="FO Date">
              <input type="date" value={form.fo_date} onChange={e => set('fo_date', e.target.value)} />
            </Field>
            <Field label="LD Date">
              <input type="date" value={form.ld_date} onChange={e => set('ld_date', e.target.value)} />
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
              ⚠️ FO Date must be before or equal to LD Date.
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
            <label>Personas Involved</label>
            <div className="toggle-group">
              {PERSONAS.map(p => (
                <button key={p.role} className={`toggle-chip ${form.personas.includes(p.role) ? 'on' : ''}`}
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
                <button key={r.k} className={`toggle-chip ${form.calendar_rows.includes(r.k) ? 'on' : ''}`}
                  onClick={() => set('calendar_rows', toggleArr(form.calendar_rows, r.k))}>
                  {r.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={!form.name.trim() || isDateInvalid}>
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