import { getActiveBrands, getActiveCustomers } from '../constants';

export default function FilterBar({ filters, setFilters }) {
  const brands = getActiveBrands(filters.org, filters.category);
  const customers = getActiveCustomers(filters.category);

  const setOrg = (val) => setFilters(f => ({ ...f, org: f.org === val ? 'Suntory Oceania' : val, brand: 'All', customer: 'All' }));
  const setCat = (val) => setFilters(f => ({ ...f, category: f.category === val ? 'All' : val, brand: 'All', customer: 'All' }));

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
      <select className="filter-select" value={filters.brand}
        onChange={e => setFilters(f => ({ ...f, brand: e.target.value }))}>
        {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
      </select>
      <div className="nav-divider"></div>
      <span className="filter-label">Customer</span>
      <select className="filter-select" value={filters.customer}
        onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))}>
        {customers.map(c => <option key={c} value={c}>{c === 'All' ? 'All Customers' : c}</option>)}
      </select>
      <div className="spacer"></div>
    </div>
  );
}
