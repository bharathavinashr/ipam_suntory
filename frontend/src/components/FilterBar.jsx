import { useState, useRef, useEffect } from 'react';
import { lookupApi } from '../api';

const ORG_TO_COUNTRY = { AU: 'Australia', NZ: 'New Zealand' };
const CATEGORY_TO_DIVISIONS = {
  All: ['Alcohol', 'Non-Alcohol'],
  Alc: ['Alcohol'],
  'Non-Alc': ['Non-Alcohol'],
};

// Fetches one lookup per division and merges the results into a flat, deduped, sorted
// list of labels (division-scoped tables use different codes per country/division for
// the same named brand/account, so options are merged by label — see backend _merge_by_label).
async function fetchOptionsByDivision(fetchFn, country, divisions) {
  const results = await Promise.all(divisions.map(division => fetchFn(division, country)));
  const labels = new Map();
  for (const r of results) {
    for (const opt of r.options || []) {
      labels.set(opt.label.toLowerCase(), opt.label);
    }
  }
  return [...labels.values()].sort((a, b) => a.localeCompare(b));
}

function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allSelected = selected.length === 0 || (selected.length === 1 && selected[0] === 'All');
  const toggle = (val) => {
    if (val === 'All') { onChange(['All']); return; }
    const next = selected.filter(s => s !== 'All').includes(val)
      ? selected.filter(s => s !== val)
      : [...selected.filter(s => s !== 'All'), val];
    onChange(next.length ? next : ['All']);
  };

  const displayText = allSelected
    ? placeholder
    : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ms-wrap" ref={ref}>
      <button className={`ms-trigger ${!allSelected ? 'ms-active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className={allSelected ? 'ms-placeholder' : 'ms-value'}>{displayText}</span>
        <svg className="chevron-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="ms-dropdown" onClick={e => e.stopPropagation()}>
          <input
            className="combo-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {!search && (
            <label className="ms-item">
              <input type="checkbox" checked={allSelected} onChange={() => toggle('All')} />
              <span>{placeholder}</span>
            </label>
          )}
          {filteredOptions.length === 0 && (
            <div className="ms-item" style={{ color: '#9ca3af', cursor: 'default' }}>No matches</div>
          )}
          {filteredOptions.map(opt => (
            <label key={opt} className="ms-item">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ filters, setFilters, showWeeks, setShowWeeks }) {
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Brand options come from ro_products.brand_name, scoped to the selected country + category
  // (mirrors the Brand lookup used in the campaign form's FormModal).
  useEffect(() => {
    const country = ORG_TO_COUNTRY[filters.org] || ORG_TO_COUNTRY.AU;
    const divisions = CATEGORY_TO_DIVISIONS[filters.category] || CATEGORY_TO_DIVISIONS.All;

    let cancelled = false;
    fetchOptionsByDivision(lookupApi.getBrands, country, divisions)
      .then(opts => { if (!cancelled) setBrands(opts); })
      .catch(() => { if (!cancelled) setBrands([]); });

    return () => { cancelled = true; };
  }, [filters.org, filters.category]);

  // Customer options come from ro_customers.account_name, scoped to the selected country +
  // category (mirrors the RO Account lookup used in the campaign form's FormModal).
  useEffect(() => {
    const country = ORG_TO_COUNTRY[filters.org] || ORG_TO_COUNTRY.AU;
    const divisions = CATEGORY_TO_DIVISIONS[filters.category] || CATEGORY_TO_DIVISIONS.All;

    let cancelled = false;
    fetchOptionsByDivision(
      (division, ctry) => lookupApi.getAccounts(ctry, '', '', division),
      country,
      divisions
    )
      .then(opts => { if (!cancelled) setCustomers(opts); })
      .catch(() => { if (!cancelled) setCustomers([]); });

    return () => { cancelled = true; };
  }, [filters.org, filters.category]);

  const selectedBrands = Array.isArray(filters.brand) ? filters.brand : [filters.brand || 'All'];
  const selectedCustomers = Array.isArray(filters.customer) ? filters.customer : [filters.customer || 'All'];

  const setOrg = (val) => setFilters(f => ({ ...f, org: val, brand: ['All'], customer: ['All'] }));
  const setCat = (val) => setFilters(f => ({ ...f, category: f.category === val ? 'All' : val, brand: ['All'], customer: ['All'] }));

  return (
    <div id="filterbar">
      <span className="filter-label">Country</span>
      <div className="chip-group">
        {['AU', 'NZ'].map(o => {
          const active = filters.org === o;
          return (
            <button 
              key={o} 
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => setOrg(o)}
            >
              {o}
            </button>
          );
        })}
      </div>
      <div className="nav-divider"></div>
      <span className="filter-label">Category</span>
      <div className="chip-group">
        {['All', 'Non-Alc', 'Alc'].map(c => {
          const active = filters.category === c;
          return (
            <button 
              key={c} 
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
      <div className="nav-divider"></div>
      <span className="filter-label">Brand</span>
      <MultiSelect
        placeholder="All Brands"
        options={brands}
        selected={selectedBrands}
        onChange={val => setFilters(f => ({ ...f, brand: val }))}
      />
      <div className="nav-divider"></div>
      <span className="filter-label">Customer</span>
      <MultiSelect
        placeholder="All Customers"
        options={customers}
        selected={selectedCustomers}
        onChange={val => setFilters(f => ({ ...f, customer: val }))}
      />
      
      <div className="spacer"></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`chip ${showWeeks ? 'active' : ''}`}
          onClick={() => setShowWeeks(!showWeeks)}
          style={{ fontWeight: 600 }}
        >
          {showWeeks ? '📅 Months View' : '📆 Weeks View'}
        </button>
      </div>
    </div>
  );
}