import { useState, useEffect, useRef } from 'react';
import { TIERS, STATUS_COL, PERSONAS, ALL_ROWS, BRAND_CFG, bc } from '../constants';
import { lookupApi } from '../api';

// Longest names first so a specific match (e.g. "Jim Beam") wins over a shorter one
// that happens to be a substring of it.
const KNOWN_BRAND_NAMES = Object.keys(BRAND_CFG)
  .filter(k => k !== 'default')
  .sort((a, b) => b.length - a.length);

// Fallback for campaigns where no RO Brand was picked: match the campaign name against
// the known brand list (mirrors the seed-data convention of naming campaigns after their
// brand, e.g. "CELSIUS FURNACE" -> Celsius, "PEPSI POWER OF ONE" -> Pepsi).
function matchBrandFromName(name) {
  const lower = (name || '').toLowerCase();
  return KNOWN_BRAND_NAMES.find(b => lower.includes(b.toLowerCase())) || '';
}

const DEFAULT_MILESTONES = [
  { l:'Brief to Agency', d:'', done:false },
  { l:'Scamps Review', d:'', done:false },
  { l:'Finance Approval', d:'', done:false },
  { l:'POS Distribution', d:'', done:false },
  { l:'Go Live', d:'', done:false },
  { l:'13-Week Review', d:'', done:false },
];

const DEFAULT = {
  name:'', brand:'', type:'', tier:'', status:'', big_bet:false,
  channel:'', customer:'', market:'', category:'', estimated_execution_date:'',
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

const getTodayStr = () => new Date().toISOString().slice(0, 10);

export default function FormModal({ campaignId, campaigns, onClose, onSave, defaultMonth, defaultRow }) {
  const existing = campaignId ? campaigns.find(c => c.id === campaignId) : null;
  const [tab, setTab] = useState('Overview');
  
  // Safely initialize state, guaranteeing milestones and tags exist for editing
  const getInitialState = (ext, month, row) => {
    const base = {
      ...DEFAULT,
      estimated_execution_date: getTodayStr(),
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
      division:   ext.ro_division || ext.division || '',
      ro_country: ext.ro_country || '',
      start_date: ext.start_date || getDefaultDate(ext.start_month) || '',
      end_date: ext.end_date || getDefaultDate(ext.end_month) || '',
      estimated_execution_date: ext.estimated_execution_date || '',
      milestones: ext.milestones?.length ? ext.milestones : DEFAULT_MILESTONES,
      tags_str: ext.tags?.join(', ') || ''
    };
  };

  const [form, setForm] = useState(() => getInitialState(existing, defaultMonth, defaultRow));
  const restoringRef = useRef(false);

  const [attachments, setAttachments] = useState(() => existing?.attachments || []);
  const [links, setLinks] = useState(() => existing?.links || []);
  const [linkInput, setLinkInput] = useState({ label: '', url: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    restoringRef.current = true;
    setForm(getInitialState(existing, defaultMonth, defaultRow));
    setSelChannels(toSelMap(existing?.ro_channels));
    setSelSubChannels(toSelMap(existing?.ro_subchannels));
    setSelAccounts(toSelMap(existing?.ro_accounts));
    setSelBrands(toSelMap(existing?.ro_brands));
    setSelBrandFamilies(toSelMap(existing?.ro_brand_families));
    setAttachments(existing?.attachments || []);
    setLinks(existing?.links || []);
  }, [campaignId, defaultMonth, defaultRow, existing]);

  const isNew = !existing;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Lookup state ──────────────────────────────────────────────────────────
  const [divisionOpts, setDivisionOpts] = useState([]);
  const [countryOpts, setCountryOpts]   = useState([]);
  const [channelOpts, setChannelOpts]   = useState([]);
  const [subChannelOpts, setSubChannelOpts] = useState([]);
  const [accountOpts, setAccountOpts]   = useState([]);
  const [brandOpts, setBrandOpts]       = useState([]);
  const [brandFamilyOpts, setBrandFamilyOpts] = useState([]);

  // multi-select state: { code: name } — restored from existing campaign
  const toSelMap = (arr) => Array.isArray(arr) ? Object.fromEntries(arr.map(o => [o.value, o.label])) : {};
  const [selChannels, setSelChannels]       = useState(() => toSelMap(existing?.ro_channels));
  const [selSubChannels, setSelSubChannels] = useState(() => toSelMap(existing?.ro_subchannels));
  const [selAccounts, setSelAccounts]       = useState(() => toSelMap(existing?.ro_accounts));
  const [selBrands, setSelBrands]           = useState(() => toSelMap(existing?.ro_brands));
  const [selBrandFamilies, setSelBrandFamilies] = useState(() => toSelMap(existing?.ro_brand_families));

  // dropdown open state
  const [channelOpen, setChannelOpen]           = useState(false);
  const [subChannelOpen, setSubChannelOpen]     = useState(false);
  const [accountOpen, setAccountOpen]           = useState(false);
  const [brandOpen, setBrandOpen]               = useState(false);
  const [brandFamilyOpen, setBrandFamilyOpen]   = useState(false);

  // search state
  const [channelSearch, setChannelSearch]           = useState('');
  const [subChannelSearch, setSubChannelSearch]     = useState('');
  const [accountSearch, setAccountSearch]           = useState('');
  const [brandSearch, setBrandSearch]               = useState('');
  const [brandFamilySearch, setBrandFamilySearch]   = useState('');

  const channelRef    = useRef(null);
  const subChRef      = useRef(null);
  const accountRef    = useRef(null);
  const brandRef      = useRef(null);
  const brandFamRef   = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (channelRef.current && !channelRef.current.contains(e.target)) setChannelOpen(false);
      if (subChRef.current && !subChRef.current.contains(e.target)) setSubChannelOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (brandRef.current && !brandRef.current.contains(e.target)) setBrandOpen(false);
      if (brandFamRef.current && !brandFamRef.current.contains(e.target)) setBrandFamilyOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load divisions on mount
  useEffect(() => {
    lookupApi.getDivisions()
      .then(d => setDivisionOpts(d.options || []))
      .catch(() => setDivisionOpts([]));
  }, []);

  // Load countries when division changes
  useEffect(() => {
    const division = form.division;
    if (!division) {
      setCountryOpts([]);
      if (!restoringRef.current) setForm(f => ({ ...f, ro_country: '' }));
      restoringRef.current = false;
      return;
    }
    lookupApi.getCountries(division)
      .then(d => { setCountryOpts(d.options || []); restoringRef.current = false; })
      .catch(() => { setCountryOpts([]); restoringRef.current = false; });
  }, [form.division]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load channels + all accounts when country changes; reset selections only if user changed it
  useEffect(() => {
    const country = form.ro_country;
    if (!country) {
      setChannelOpts([]); setSubChannelOpts([]); setAccountOpts([]);
      if (!restoringRef.current) { setSelChannels({}); setSelSubChannels({}); setSelAccounts({}); }
      return;
    }
    const restoring = restoringRef.current;
    lookupApi.getChannels(country)
      .then(d => setChannelOpts(d.options || []))
      .catch(() => setChannelOpts([]));
    lookupApi.getAccounts(country)
      .then(d => setAccountOpts(d.options || []))
      .catch(() => setAccountOpts([]));
    if (!restoring) { setSelChannels({}); setSelSubChannels({}); setSelAccounts({}); }
  }, [form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load brands when division + country are both set; reset brand selections only if user changed it
  useEffect(() => {
    const { division, ro_country } = form;
    if (!division || !ro_country) {
      setBrandOpts([]); setBrandFamilyOpts([]);
      if (!restoringRef.current) { setSelBrands({}); setSelBrandFamilies({}); }
      return;
    }
    const restoring = restoringRef.current;
    lookupApi.getBrands(division, ro_country)
      .then(d => setBrandOpts(d.options || []))
      .catch(() => setBrandOpts([]));
    if (!restoring) { setSelBrands({}); setSelBrandFamilies({}); }
  }, [form.division, form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load subchannels filtered by selected channels
  useEffect(() => {
    const country = form.ro_country;
    if (!country) { setSubChannelOpts([]); return; }
    const codes = Object.keys(selChannels);
    if (!codes.length) {
      lookupApi.getSubchannels(country)
        .then(d => setSubChannelOpts(d.options || []))
        .catch(() => setSubChannelOpts([]));
      return;
    }
    Promise.all(codes.map(c => lookupApi.getSubchannels(country, c)))
      .then(results => {
        const map = new Map();
        results.forEach(r => (r.options || []).forEach(o => map.set(o.value, o)));
        setSubChannelOpts(Array.from(map.values()));
      })
      .catch(() => setSubChannelOpts([]));
  }, [selChannels, form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load brand families filtered by selected brands
  useEffect(() => {
    const { division, ro_country } = form;
    if (!division || !ro_country) { setBrandFamilyOpts([]); return; }
    const codes = Object.keys(selBrands);
    lookupApi.getBrandFamilies(division, ro_country, codes)
      .then(d => setBrandFamilyOpts(d.options || []))
      .catch(() => setBrandFamilyOpts([]));
  }, [selBrands, form.division, form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Multi-select toggle helpers ───────────────────────────────────────────
  const toggleItem = (setter, code, name) =>
    setter(prev => { const n = { ...prev }; n[code] ? delete n[code] : (n[code] = name); return n; });

  const toggleAll = (setter, opts, current) =>
    setter(Object.keys(current).length === opts.length ? {} : Object.fromEntries(opts.map(o => [o.value, o.label])));

  const multiLabel = (sel, placeholder) => {
    const vals = Object.values(sel);
    return vals.length ? vals.join(', ') : placeholder;
  };

  const filtered = (opts, search) =>
    opts.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  
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

    const s_month = form.start_date ? getMonthKey(form.start_date) : (form.start_month || '');
    const e_month = form.end_date ? getMonthKey(form.end_date) : (form.end_month || '');

    // Market/Category no longer have their own dropdowns (see Division/Country below) —
    // derive them so campaigns still match the AU/NZ + Alc/Non-Alc filters used everywhere else.
    const derivedMarket = /new zealand/i.test(form.ro_country || '') ? 'NZ' : 'AU';
    const derivedCategory = form.division === 'Alcohol' ? 'Alc' : 'Non-Alc';
    // Brand (drives chip/badge color) no longer has its own dropdown either — use the first
    // selected RO Brand, falling back to matching the campaign name against known brands.
    const derivedBrand = Object.values(selBrands)[0] || matchBrandFromName(form.name);

    const payload = {
      name:             form.name,
      brand:            derivedBrand,
      type:             form.type             || '',
      tier:             form.tier             || '',
      status:           form.status           || '',
      big_bet:          !!form.big_bet,
      estimated_execution_date: form.estimated_execution_date || '',
      channel:          form.channel          || '',
      customer:         form.customer         || '',
      market:           derivedMarket,
      category:         derivedCategory,
      start_month:      s_month,
      end_month:        e_month,
      calendar_rows:    form.calendar_rows    || [],
      fo_date:          form.fo_date          || '',
      ld_date:          form.ld_date          || '',
      first_order_date: form.first_order_date || '',
      last_order_date:  form.last_order_date  || '',
      budget:           form.budget           || 0,
      store_targets:    form.store_targets    || 0,
      objective:        form.objective        || '',
      success_criteria: form.success_criteria || '',
      notes:            form.notes            || '',
      tags:             form.tags_str ? form.tags_str.split(',').map(s => s.trim()).filter(Boolean) : [],
      personas:         form.personas         || [],
      images:           existing?.images      || [],
      milestones:       form.milestones       || [],
      review_due:       form.review_due       || '',
      reviewed:         form.reviewed         || false,
      review_score:     form.review_score     || null,
      ro_division:      form.division         || '',
      ro_country:       form.ro_country       || '',
      ro_channels:      Object.entries(selChannels).map(([value, label]) => ({ value, label })),
      ro_subchannels:   Object.entries(selSubChannels).map(([value, label]) => ({ value, label })),
      ro_accounts:      Object.entries(selAccounts).map(([value, label]) => ({ value, label })),
      ro_brands:        Object.entries(selBrands).map(([value, label]) => ({ value, label })),
      ro_brand_families: Object.entries(selBrandFamilies).map(([value, label]) => ({ value, label })),
      attachments,
      links,
    };

    onSave(payload, isNew, campaignId);
  };

  const previewBrand = Object.values(selBrands)[0] || matchBrandFromName(form.name);
  const bcfg = bc(previewBrand);
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
              <div style={{ fontSize:8, opacity:.7, color:bcfg.txt }}>{previewBrand} · {form.tier}</div>
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
              <div className="form-row">
                <Field label="Campaign / Product Name">
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. V AMETHYST" />
                </Field>
                <Field label="Activation Period">
                  <select value={form.tier} onChange={e => set('tier', e.target.value)}>
                    <option value="">-- Select --</option>
                    {Object.keys(TIERS).map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="form-row">
                <Field label="Status">
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="">-- Select --</option>
                    {Object.keys(STATUS_COL).map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Big Bet">
                  <label style={{ display:'flex', alignItems:'center', gap:6, height:'100%' }}>
                    <input type="checkbox" checked={!!form.big_bet} onChange={e => set('big_bet', e.target.checked)} />
                    <span style={{ fontSize:11, color:'#374151' }}>{form.big_bet ? 'Yes' : 'No'}</span>
                  </label>
                </Field>
              </div>

              {/* ── RO Lookup Fields ── */}
              <div className="form-row">
                <Field label="Division">
                  <select value={form.division || ''} onChange={e => { restoringRef.current = false; set('division', e.target.value); }}>
                    <option value="">-- Select --</option>
                    {divisionOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Country">
                  <select value={form.ro_country || ''} onChange={e => { restoringRef.current = false; set('ro_country', e.target.value); }} disabled={!form.division}>
                    <option value="">-- Select --</option>
                    {countryOpts.map(o => <option key={o.value} value={o.label}>{o.label}</option>)}
                  </select>
                </Field>

                <div className="field" ref={channelRef}>
                  <label>Channel</label>
                  <div className="multi-combo" onClick={() => form.ro_country && setChannelOpen(o => !o)}>
                    <span className={Object.keys(selChannels).length ? '' : 'placeholder'}>{multiLabel(selChannels, 'Select channels')}</span>
                    <span className="combo-arrow">&#9662;</span>
                  </div>
                  {channelOpen && (
                    <div className="combo-dropdown">
                      <input className="combo-search" placeholder="Search..." value={channelSearch} onChange={e => setChannelSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                      <label className="combo-item combo-select-all">
                        <input type="checkbox" checked={channelOpts.length > 0 && Object.keys(selChannels).length === channelOpts.length} onChange={() => toggleAll(setSelChannels, channelOpts, selChannels)} /> Select All
                      </label>
                      {filtered(channelOpts, channelSearch).map(o => (
                        <label key={o.value} className="combo-item">
                          <input type="checkbox" checked={!!selChannels[o.value]} onChange={() => toggleItem(setSelChannels, o.value, o.label)} /> {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field" ref={brandRef}>
                  <label>Brand</label>
                  <div className="multi-combo" onClick={() => (form.division && form.ro_country) && setBrandOpen(o => !o)}>
                    <span className={Object.keys(selBrands).length ? '' : 'placeholder'}>{multiLabel(selBrands, 'Select brands')}</span>
                    <span className="combo-arrow">&#9662;</span>
                  </div>
                  {brandOpen && (
                    <div className="combo-dropdown">
                      <input className="combo-search" placeholder="Search..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                      <label className="combo-item combo-select-all">
                        <input type="checkbox" checked={brandOpts.length > 0 && Object.keys(selBrands).length === brandOpts.length} onChange={() => toggleAll(setSelBrands, brandOpts, selBrands)} /> Select All
                      </label>
                      {filtered(brandOpts, brandSearch).map(o => (
                        <label key={o.value} className="combo-item">
                          <input type="checkbox" checked={!!selBrands[o.value]} onChange={() => toggleItem(setSelBrands, o.value, o.label)} /> {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field" ref={subChRef}>
                  <label>Sub Channel</label>
                  <div className="multi-combo" onClick={() => form.ro_country && setSubChannelOpen(o => !o)}>
                    <span className={Object.keys(selSubChannels).length ? '' : 'placeholder'}>{multiLabel(selSubChannels, 'Select sub-channels')}</span>
                    <span className="combo-arrow">&#9662;</span>
                  </div>
                  {subChannelOpen && (
                    <div className="combo-dropdown">
                      <input className="combo-search" placeholder="Search..." value={subChannelSearch} onChange={e => setSubChannelSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                      <label className="combo-item combo-select-all">
                        <input type="checkbox" checked={subChannelOpts.length > 0 && Object.keys(selSubChannels).length === subChannelOpts.length} onChange={() => toggleAll(setSelSubChannels, subChannelOpts, selSubChannels)} /> Select All
                      </label>
                      {filtered(subChannelOpts, subChannelSearch).map(o => (
                        <label key={o.value} className="combo-item">
                          <input type="checkbox" checked={!!selSubChannels[o.value]} onChange={() => toggleItem(setSelSubChannels, o.value, o.label)} /> {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field" ref={brandFamRef}>
                  <label>Brand Family</label>
                  <div className="multi-combo" onClick={() => (form.division && form.ro_country) && setBrandFamilyOpen(o => !o)}>
                    <span className={Object.keys(selBrandFamilies).length ? '' : 'placeholder'}>{multiLabel(selBrandFamilies, 'Select brand families')}</span>
                    <span className="combo-arrow">&#9662;</span>
                  </div>
                  {brandFamilyOpen && (
                    <div className="combo-dropdown">
                      <input className="combo-search" placeholder="Search..." value={brandFamilySearch} onChange={e => setBrandFamilySearch(e.target.value)} onClick={e => e.stopPropagation()} />
                      <label className="combo-item combo-select-all">
                        <input type="checkbox" checked={brandFamilyOpts.length > 0 && Object.keys(selBrandFamilies).length === brandFamilyOpts.length} onChange={() => toggleAll(setSelBrandFamilies, brandFamilyOpts, selBrandFamilies)} /> Select All
                      </label>
                      {filtered(brandFamilyOpts, brandFamilySearch).map(o => (
                        <label key={o.value} className="combo-item">
                          <input type="checkbox" checked={!!selBrandFamilies[o.value]} onChange={() => toggleItem(setSelBrandFamilies, o.value, o.label)} /> {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field" ref={accountRef}>
                  <label>Account</label>
                  <div className="multi-combo" onClick={() => form.ro_country && setAccountOpen(o => !o)}>
                    <span className={Object.keys(selAccounts).length ? '' : 'placeholder'}>{multiLabel(selAccounts, 'Select accounts')}</span>
                    <span className="combo-arrow">&#9662;</span>
                  </div>
                  {accountOpen && (
                    <div className="combo-dropdown">
                      <input className="combo-search" placeholder="Search..." value={accountSearch} onChange={e => setAccountSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                      <label className="combo-item combo-select-all">
                        <input type="checkbox" checked={accountOpts.length > 0 && Object.keys(selAccounts).length === accountOpts.length} onChange={() => toggleAll(setSelAccounts, accountOpts, selAccounts)} /> Select All
                      </label>
                      {filtered(accountOpts, accountSearch).map(o => (
                        <label key={o.value} className="combo-item">
                          <input type="checkbox" checked={!!selAccounts[o.value]} onChange={() => toggleItem(setSelAccounts, o.value, o.label)} /> {o.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <Field label="Estimated Time for Execution">
                  <input type="date" value={form.estimated_execution_date || ''} onChange={e => set('estimated_execution_date', e.target.value)} />
                </Field>
              </div>

              <div className="form-row">
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

              {/* ── Attachments ── */}
              <div className="field">
                <label>Attachments</label>
                <div className="attach-zone" onClick={() => fileInputRef.current.click()}>
                  <span>📎 Click to upload — images, PDF, PPT, Word</span>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.ppt,.pptx,.doc,.docx" style={{ display:'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = ev => setAttachments(prev => [...prev, {
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          data: ev.target.result,
                        }]);
                        reader.readAsDataURL(file);
                      });
                      e.target.value = '';
                    }}
                  />
                </div>
                {attachments.length > 0 && (
                  <div className="attach-list">
                    {attachments.map((f, i) => (
                      <div key={i} className="attach-item">
                        <span className="attach-icon">{f.type?.startsWith('image/') ? '🖼️' : f.type?.includes('pdf') ? '📄' : f.type?.includes('presentation') || f.name?.endsWith('.ppt') || f.name?.endsWith('.pptx') ? '📊' : '📝'}</span>
                        <a href={f.data} download={f.name} className="attach-name">{f.name}</a>
                        <span className="attach-size">{f.size ? `${(f.size/1024).toFixed(0)} KB` : ''}</span>
                        <button type="button" className="attach-remove" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Links ── */}
              <div className="field">
                <label>Links</label>
                <div className="link-add-row">
                  <input placeholder="Label (e.g. Brief)" value={linkInput.label} onChange={e => setLinkInput(l => ({ ...l, label: e.target.value }))} className="link-input" />
                  <input placeholder="URL (https://...)" value={linkInput.url} onChange={e => setLinkInput(l => ({ ...l, url: e.target.value }))} className="link-input" />
                  <button type="button" className="link-add-btn"
                    disabled={!linkInput.url.trim()}
                    onClick={() => {
                      if (!linkInput.url.trim()) return;
                      setLinks(prev => [...prev, { label: linkInput.label.trim() || linkInput.url.trim(), url: linkInput.url.trim() }]);
                      setLinkInput({ label: '', url: '' });
                    }}>+ Add</button>
                </div>
                {links.length > 0 && (
                  <div className="attach-list">
                    {links.map((lk, i) => (
                      <div key={i} className="attach-item">
                        <span className="attach-icon">🔗</span>
                        <a href={lk.url} target="_blank" rel="noreferrer" className="attach-name">{lk.label}</a>
                        <button type="button" className="attach-remove" onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
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