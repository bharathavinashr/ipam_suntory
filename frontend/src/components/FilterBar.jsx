import { useState, useRef, useEffect } from 'react';
import { getActiveBrands, getActiveCustomers } from '../constants';

function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
          {['All', ...options.filter(o => o !== 'All')].map(opt => (
            <label key={opt} className="ms-item">
              <input
                type="checkbox"
                checked={opt === 'All' ? allSelected : selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{opt === 'All' ? placeholder : opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ filters, setFilters }) {
  const brands = getActiveBrands(filters.org, filters.category).filter(b => b !== 'All');
  const customers = getActiveCustomers(filters.category).filter(c => c !== 'All' && c !== 'All Customers');

  const selectedBrands = Array.isArray(filters.brand) ? filters.brand : [filters.brand || 'All'];
  const selectedCustomers = Array.isArray(filters.customer) ? filters.customer : [filters.customer || 'All'];

  const setOrg = (val) => setFilters(f => ({ ...f, org: f.org === val ? 'Suntory Oceania' : val, brand: ['All'], customer: ['All'] }));
  const setCat = (val) => setFilters(f => ({ ...f, category: f.category === val ? 'All' : val, brand: ['All'], customer: ['All'] }));

  const orgColors = { 'Suntory Oceania': '#7C3AED', AU: '#7C3AED', NZ: '#7C3AED' };
  const catColors = { All: '#475569', 'Non-Alc': '#059669', Alc: '#DC2626' };

  return (
    <div id="filterbar">
      <span className="filter-label">Org</span>
      <div className="chip-group">
        {['Suntory Oceania', 'AU', 'NZ'].map(o => {
          const active = filters.org === o;
          return (
            <button key={o} className={`chip ${active ? 'active' : ''}`}
              style={active ? { background: orgColors[o], borderColor: orgColors[o], color: '#fff' } : {}}
              onClick={() => setOrg(o)}>{o}</button>
          );
        })}
      </div>
      <div className="nav-divider"></div>
      <span className="filter-label">Category</span>
      <div className="chip-group">
        {['All', 'Non-Alc', 'Alc'].map(c => {
          const active = filters.category === c;
          const col = catColors[c];
          return (
            <button key={c} className={`chip ${active ? 'active' : ''}`}
              style={active ? { background: col, borderColor: col, color: '#fff' } : {}}
              onClick={() => setCat(c)}>{c}</button>
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
    </div>
  );
}
