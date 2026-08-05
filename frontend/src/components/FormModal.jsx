import { useState, useEffect, useRef } from 'react';
import { TIERS, STATUS_COL, PERSONAS, BRAND_CFG, bc, CATEGORY_OPTIONS } from '../constants';
import { lookupApi, attachmentsApi } from '../api';

function formatUploadedAt(iso) {
  if (!iso) return '';
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

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

const PRIORITY_NUMBERS = ['#1', '#2', '#3', '#4', '#5'];

const DEFAULT_MILESTONES = [
  { l:'Budget agreed with Shopper Marketing', d:'', done:false },
  { l:'Planning workshops with KAMs', d:'', done:false },
  { l:'Approved KV handed over to Shopper Marketing', d:'', done:false },
  { l:'Brief Raydar Channel specific POS and PoFs', d:'', done:false },
  { l:'Book Channel specific Media/Space (Precision 12w) (Cartology 12w) Early as Poss', d:'', done:false },
  { l:'Cycle Briefing and share PoFs', d:'', done:false },
  { l:'Liaise with Agency/ KAMs on feedback', d:'', done:false },
  { l:'Customer approval of final POS suite', d:'', done:false },
  { l:'POS Order Sheet to ASMs', d:'', done:false },
  { l:'Send final Dispatch sheet to Raydar and BrandSpec for print & dispatch', d:'', done:false },
  { l:'Dispatch to regions', d:'', done:false },
  { l:'Live in Market OILS', d:'', done:false },
  { l:'Live in Market OTG', d:'', done:false },
  { l:'Live in Market GROCERY', d:'', done:false },
  { l:'Live in Market LICENSED', d:'', done:false },
];

const DEFAULT = {
  name:'', brand:'', type:'', tier:'', status:'', big_bet:false, priority_number:'',
  channel:'', customer:'', market:'', category:'', campaign_category:'', estimated_execution_date:'',
  calendar_rows:['NPD1'], start_date:'', end_date:'', first_order_date:'', last_order_date:'', budget:0, store_targets:0,
  fo_date_indirect_au:'', fo_date_direct_au:'', launch_date_au:'', campaign_end_date_au:'',
  fo_date_direct_nz:'', launch_date_nz:'', campaign_end_date_nz:'',
  budget_aud:0, budget_nzd:0, store_targets_au:0, store_targets_nz:0,
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
      ...(row?.block === 'category' && { campaign_category: row.value }),
      ...(row?.block === 'priority' && { tier: row.value }),
      ...(row?.block === 'channel' && row.priorityNumber && { priority_number: row.priorityNumber }),
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

  const [attachments, setAttachments] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [links, setLinks] = useState(() => existing?.links || []);
  const [linkInput, setLinkInput] = useState({ label: '', url: '' });
  const fileInputRef = useRef(null);

  const uploadFiles = (fileList) => {
    Array.from(fileList).forEach(file => {
      attachmentsApi.upload(campaignId, file)
        .then(a => setAttachments(prev => [...prev, a]))
        .catch(err => console.error('Upload failed', err));
    });
  };

  useEffect(() => {
    restoringRef.current = true;
    setForm(getInitialState(existing, defaultMonth, defaultRow));
    setSelChannels(toSelMap(existing?.ro_channels));
    setSelSubChannels(toSelMap(existing?.ro_subchannels));
    setSelAccounts(toSelMap(existing?.ro_accounts));
    setSelBrands(toSelMap(existing?.ro_brands));
    setSelBrandFamilies(toSelMap(existing?.ro_brand_families));
    setLinks(existing?.links || []);
    setPendingChannelPrefill(defaultRow?.block === 'channel' ? { channel: defaultRow.channel, account: defaultRow.account } : null);
  }, [campaignId, defaultMonth, defaultRow, existing]);

  useEffect(() => {
    if (!campaignId) { setAttachments([]); return; }
    attachmentsApi.list(campaignId).then(setAttachments).catch(err => console.error('Failed to load attachments', err));
  }, [campaignId]);

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

  // Best-effort prefill when opened via the calendar's Channel/Account block "+" — the row
  // only knows the channel/account label (not the RO code), so we wait for the option lists
  // to load (once Division + Country are picked) and select the matching label.
  const [pendingChannelPrefill, setPendingChannelPrefill] = useState(() =>
    defaultRow?.block === 'channel' ? { channel: defaultRow.channel, account: defaultRow.account } : null
  );

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

  // Load channels when country changes; reset selections only if user changed it
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

  // Load accounts filtered by whichever channels/sub-channels are selected — narrows the
  // Account list instead of always showing every account in the country. Each returned
  // option is tagged with the channel(s) (within this filter) it belongs to, which
  // handleSave uses to pair a selected account back to its exact channel.
  useEffect(() => {
    const country = form.ro_country;
    if (!country) { setAccountOpts([]); return; }
    const channelCodes = Object.keys(selChannels).join(',');
    const subChannelCodes = Object.keys(selSubChannels).join(',');
    lookupApi.getAccounts(country, channelCodes, subChannelCodes)
      .then(d => setAccountOpts(d.options || []))
      .catch(() => setAccountOpts([]));
  }, [selChannels, selSubChannels, form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load brand families filtered by selected brands
  useEffect(() => {
    const { division, ro_country } = form;
    if (!division || !ro_country) { setBrandFamilyOpts([]); return; }
    const codes = Object.keys(selBrands);
    lookupApi.getBrandFamilies(division, ro_country, codes)
      .then(d => setBrandFamilyOpts(d.options || []))
      .catch(() => setBrandFamilyOpts([]));
  }, [selBrands, form.division, form.ro_country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve the best-effort Channel/Account prefill once the option lists load (i.e. once
  // the user, or a restored campaign, has Division + Country set).
  useEffect(() => {
    if (!pendingChannelPrefill || !channelOpts.length) return;
    const match = channelOpts.find(o => o.label === pendingChannelPrefill.channel);
    if (match) setSelChannels(prev => ({ ...prev, [match.value]: match.label }));
  }, [channelOpts, pendingChannelPrefill]);

  useEffect(() => {
    if (!pendingChannelPrefill || !accountOpts.length) return;
    const match = accountOpts.find(o => o.label === pendingChannelPrefill.account);
    if (match) setSelAccounts(prev => ({ ...prev, [match.value]: match.label }));
  }, [accountOpts, pendingChannelPrefill]);

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

  // Country-conditional field visibility: Australia and ANZ both need the AU field set,
  // New Zealand and ANZ both need the NZ field set.
  const isAU = form.ro_country === 'Australia' || form.ro_country === 'ANZ';
  const isNZ = form.ro_country === 'New Zealand' || form.ro_country === 'ANZ';

  const handleSave = () => {
    if (!form.name.trim() || isDateInvalid) return;

    const s_month = form.start_date ? getMonthKey(form.start_date) : (form.start_month || '');
    const e_month = form.end_date ? getMonthKey(form.end_date) : (form.end_month || '');

    // Budget/Store Targets split into AUD/NZD lines when a country is picked; `budget` and
    // `store_targets` stay the combined totals used everywhere else in the app (cards, KPIs, DataNavi).
    const derivedBudget = form.ro_country === 'Australia' ? (form.budget_aud || 0)
      : form.ro_country === 'New Zealand' ? (form.budget_nzd || 0)
      : form.ro_country === 'ANZ' ? (form.budget_aud || 0) + (form.budget_nzd || 0)
      : (form.budget || 0);
    const derivedStoreTargets = form.ro_country === 'Australia' ? (form.store_targets_au || 0)
      : form.ro_country === 'New Zealand' ? (form.store_targets_nz || 0)
      : form.ro_country === 'ANZ' ? (form.store_targets_au || 0) + (form.store_targets_nz || 0)
      : (form.store_targets || 0);

    // Market/Category no longer have their own dropdowns (see Division/Country below) —
    // derive them so campaigns still match the AU/NZ + Alc/Non-Alc filters used everywhere else.
    const derivedMarket = /new zealand/i.test(form.ro_country || '') ? 'NZ' : 'AU';
    const derivedCategory = form.division === 'Alcohol' ? 'Alc' : 'Non-Alc';
    // Brand (drives chip/badge color) no longer has its own dropdown either — use the first
    // selected RO Brand, falling back to matching the campaign name against known brands.
    const derivedBrand = Object.values(selBrands)[0] || matchBrandFromName(form.name);
    // Customer (drives the FilterBar Customer filter) — use the first selected RO Account,
    // same pattern as derivedBrand, so it matches the ro_customers.account_name values FilterBar fetches.
    const derivedCustomer = Object.values(selAccounts)[0] || form.customer || '';

    const payload = {
      name:             form.name,
      brand:            derivedBrand,
      type:             form.type             || '',
      tier:             form.tier             || '',
      status:           form.status           || '',
      big_bet:          !!form.big_bet,
      priority_number:  form.priority_number   || '',
      estimated_execution_date: form.estimated_execution_date || '',
      channel:          form.channel          || '',
      customer:         derivedCustomer,
      campaign_category: form.campaign_category || '',
      market:           derivedMarket,
      category:         derivedCategory,
      start_month:      s_month,
      end_month:        e_month,
      calendar_rows:    form.calendar_rows    || [],
      fo_date:          form.fo_date          || '',
      ld_date:          form.ld_date          || '',
      first_order_date: form.first_order_date || '',
      last_order_date:  form.last_order_date  || '',
      budget:           derivedBudget,
      store_targets:    derivedStoreTargets,
      fo_date_indirect_au:  form.fo_date_indirect_au  || '',
      fo_date_direct_au:    form.fo_date_direct_au    || '',
      launch_date_au:       form.launch_date_au       || '',
      campaign_end_date_au: form.campaign_end_date_au || '',
      fo_date_direct_nz:    form.fo_date_direct_nz    || '',
      launch_date_nz:       form.launch_date_nz       || '',
      campaign_end_date_nz: form.campaign_end_date_nz || '',
      budget_aud:        form.budget_aud        || 0,
      budget_nzd:        form.budget_nzd        || 0,
      store_targets_au:  form.store_targets_au  || 0,
      store_targets_nz:  form.store_targets_nz  || 0,
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
      // Tag each account with the channel(s) it belongs to (from the currently filtered
      // accountOpts) so the calendar can map multi-channel + multi-account campaigns to the
      // exact channel each account came from, instead of assuming ro_channels[0].
      ro_accounts:      Object.entries(selAccounts).map(([value, label]) => ({
        value, label, channels: accountOpts.find(o => o.value === value)?.channels || [],
      })),
      ro_brands:        Object.entries(selBrands).map(([value, label]) => ({ value, label })),
      ro_brand_families: Object.entries(selBrandFamilies).map(([value, label]) => ({ value, label })),
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
                <Field label="Activation Tier">
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
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ flex:'0 0 60%' }}>
                    <Field label="Priority Number">
                      <select value={form.priority_number || ''} onChange={e => set('priority_number', e.target.value)}>
                        <option value="">-- Select --</option>
                        {PRIORITY_NUMBERS.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ flex:'0 0 40%' }}>
                    <Field label="Big Bet">
                      <label style={{ display:'flex', alignItems:'center', gap:6, margin:0, height:34 }}>
                        <input type="checkbox" checked={!!form.big_bet} onChange={e => set('big_bet', e.target.checked)}
                          style={{ width:16, height:16, flex:'0 0 auto', margin:0 }} />
                        <span style={{ fontSize:11, color:'#374151', textTransform:'none' }}>{form.big_bet ? 'Yes' : 'No'}</span>
                      </label>
                    </Field>
                  </div>
                </div>
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
                    <svg className="combo-arrow chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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

                <Field label="Category">
                  <select value={form.campaign_category || ''} onChange={e => set('campaign_category', e.target.value)}>
                    <option value="">-- Select --</option>
                    {CATEGORY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>

                <div className="field" ref={subChRef}>
                  <label>Sub Channel</label>
                  <div className="multi-combo" onClick={() => form.ro_country && setSubChannelOpen(o => !o)}>
                    <span className={Object.keys(selSubChannels).length ? '' : 'placeholder'}>{multiLabel(selSubChannels, 'Select sub-channels')}</span>
                    <svg className="combo-arrow chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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

                <div className="field" ref={brandRef}>
                  <label>Brand</label>
                  <div className="multi-combo" onClick={() => (form.division && form.ro_country) && setBrandOpen(o => !o)}>
                    <span className={Object.keys(selBrands).length ? '' : 'placeholder'}>{multiLabel(selBrands, 'Select brands')}</span>
                    <svg className="combo-arrow chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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

                <div className="field" ref={accountRef}>
                  <label>Account</label>
                  <div className="multi-combo" onClick={() => form.ro_country && setAccountOpen(o => !o)}>
                    <span className={Object.keys(selAccounts).length ? '' : 'placeholder'}>{multiLabel(selAccounts, 'Select accounts')}</span>
                    <svg className="combo-arrow chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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

                <div className="field" ref={brandFamRef}>
                  <label>Brand Family</label>
                  <div className="multi-combo" onClick={() => (form.division && form.ro_country) && setBrandFamilyOpen(o => !o)}>
                    <span className={Object.keys(selBrandFamilies).length ? '' : 'placeholder'}>{multiLabel(selBrandFamilies, 'Select brand families')}</span>
                    <svg className="combo-arrow chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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
              </div>

              <div className="form-row">
                <Field label="Start Date">
                  <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                </Field>
                {!form.ro_country && (
                  <>
                    <Field label="First Order Date">
                      <input type="date" value={form.first_order_date || ''} onChange={e => set('first_order_date', e.target.value)} />
                    </Field>
                    <Field label="Last Order Date">
                      <input type="date" value={form.last_order_date || ''} onChange={e => set('last_order_date', e.target.value)} />
                    </Field>
                  </>
                )}
              </div>

              {/* ── Country-conditional AU/NZ order & launch dates ── */}
              {isAU && (
                <div className="form-row">
                  <Field label="First Order Date (Indirect) AU">
                    <input type="date" value={form.fo_date_indirect_au || ''} onChange={e => set('fo_date_indirect_au', e.target.value)} />
                  </Field>
                  <Field label="First Order Date (Directs) AU">
                    <input type="date" value={form.fo_date_direct_au || ''} onChange={e => set('fo_date_direct_au', e.target.value)} />
                  </Field>
                  <Field label="Launch Date AU">
                    <input type="date" value={form.launch_date_au || ''} onChange={e => set('launch_date_au', e.target.value)} />
                  </Field>
                  <Field label="Campaign End Date AU">
                    <input type="date" value={form.campaign_end_date_au || ''} onChange={e => set('campaign_end_date_au', e.target.value)} />
                  </Field>
                </div>
              )}
              {isNZ && (
                <div className="form-row">
                  <Field label="First Order Date (Directs only) NZ">
                    <input type="date" value={form.fo_date_direct_nz || ''} onChange={e => set('fo_date_direct_nz', e.target.value)} />
                  </Field>
                  <Field label="Launch Date NZ">
                    <input type="date" value={form.launch_date_nz || ''} onChange={e => set('launch_date_nz', e.target.value)} />
                  </Field>
                  <Field label="Campaign End Date NZ">
                    <input type="date" value={form.campaign_end_date_nz || ''} onChange={e => set('campaign_end_date_nz', e.target.value)} />
                  </Field>
                </div>
              )}

              {/* ── Budget & Store Target lines — split into AUD/NZD when Country = ANZ ── */}
              {!form.ro_country && (
                <div className="form-row">
                  <Field label="Budget ($)">
                    <input type="number" value={form.budget || ''} placeholder="0" onChange={e => set('budget', +e.target.value)} />
                  </Field>
                  <Field label="Store Targets">
                    <input type="number" value={form.store_targets || ''} placeholder="0" onChange={e => set('store_targets', +e.target.value)} />
                  </Field>
                </div>
              )}
              {form.ro_country === 'Australia' && (
                <div className="form-row">
                  <Field label="Budget (AUD)">
                    <input type="number" value={form.budget_aud || ''} placeholder="0" onChange={e => set('budget_aud', +e.target.value)} />
                  </Field>
                  <Field label="Store Targets (AU)">
                    <input type="number" value={form.store_targets_au || ''} placeholder="0" onChange={e => set('store_targets_au', +e.target.value)} />
                  </Field>
                </div>
              )}
              {form.ro_country === 'New Zealand' && (
                <div className="form-row">
                  <Field label="Budget (NZD)">
                    <input type="number" value={form.budget_nzd || ''} placeholder="0" onChange={e => set('budget_nzd', +e.target.value)} />
                  </Field>
                  <Field label="Store Targets (NZ)">
                    <input type="number" value={form.store_targets_nz || ''} placeholder="0" onChange={e => set('store_targets_nz', +e.target.value)} />
                  </Field>
                </div>
              )}
              {form.ro_country === 'ANZ' && (
                <div className="form-row">
                  <Field label="Budget (AUD)">
                    <input type="number" value={form.budget_aud || ''} placeholder="0" onChange={e => set('budget_aud', +e.target.value)} />
                  </Field>
                  <Field label="Budget (NZD)">
                    <input type="number" value={form.budget_nzd || ''} placeholder="0" onChange={e => set('budget_nzd', +e.target.value)} />
                  </Field>
                  <Field label="Store Targets (AU)">
                    <input type="number" value={form.store_targets_au || ''} placeholder="0" onChange={e => set('store_targets_au', +e.target.value)} />
                  </Field>
                  <Field label="Store Targets (NZ)">
                    <input type="number" value={form.store_targets_nz || ''} placeholder="0" onChange={e => set('store_targets_nz', +e.target.value)} />
                  </Field>
                </div>
              )}

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

              {/* ── Attachments ── */}
              <div className="field">
                <label>Attachments</label>
                {isNew ? (
                  <div className="attach-zone attach-zone-disabled">
                    <span>📎 Save the campaign first to add attachments</span>
                  </div>
                ) : (
                  <div
                    className={`attach-zone ${isDraggingFile ? 'attach-zone-dragover' : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      uploadFiles(e.dataTransfer.files);
                    }}
                  >
                    <span>📎 Click to upload or drag and drop — images, PDF, PPT, Word</span>
                    <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.ppt,.pptx,.doc,.docx" style={{ display:'none' }}
                      onChange={e => {
                        uploadFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="attach-list">
                    {attachments.map(f => (
                      <div key={f.id} className="attach-item">
                        <span className="attach-icon">{f.content_type?.startsWith('image/') ? '🖼️' : f.content_type?.includes('pdf') ? '📄' : f.content_type?.includes('presentation') || f.filename?.endsWith('.ppt') || f.filename?.endsWith('.pptx') ? '📊' : '📝'}</span>
                        {renamingId === f.id ? (
                          <input
                            className="attach-rename-input"
                            defaultValue={f.filename}
                            autoFocus
                            onBlur={e => {
                              const filename = e.target.value.trim();
                              setRenamingId(null);
                              if (!filename || filename === f.filename) return;
                              attachmentsApi.rename(campaignId, f.id, filename)
                                .then(updated => setAttachments(prev => prev.map(a => a.id === f.id ? updated : a)))
                                .catch(err => console.error('Rename failed', err));
                            }}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setRenamingId(null); }}
                          />
                        ) : (
                          <span className="attach-name-group">
                            <a href={attachmentsApi.downloadUrl(campaignId, f.id)} className="attach-name">{f.filename}</a>
                            <button type="button" className="attach-rename" title="Rename" onClick={() => setRenamingId(f.id)}>✎</button>
                            <span className="attach-meta">{f.uploaded_by} · {formatUploadedAt(f.uploaded_at)}</span>
                          </span>
                        )}
                        <span className="attach-size">{f.size ? `${(f.size/1024).toFixed(0)} KB` : ''}</span>
                        <button type="button" className="attach-remove" onClick={() => {
                          attachmentsApi.remove(campaignId, f.id)
                            .then(() => setAttachments(prev => prev.filter(a => a.id !== f.id)))
                            .catch(err => console.error('Delete failed', err));
                        }}>✕</button>
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