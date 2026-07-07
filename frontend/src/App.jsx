import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { api } from './api';
import TopNav from './components/TopNav';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import ToolView from './components/ToolView';
import DetailModal from './components/DetailModal';
import FormModal from './components/FormModal';
import DataNavi from './components/DataNavi';

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [canEdit, setCanEdit] = useState(false);
  const [dnOpen, setDnOpen] = useState(false);
  const [filters, setFilters] = useState({ org:'AU & NZ', category:'All', brand:['All'], customer:['All'] });
  const [detailCampaign, setDetailCampaign] = useState(null);
  const [formCampaignId, setFormCampaignId] = useState(undefined);   // undefined=closed, null=new, string=edit
  const [formDefaultMonth, setFormDefaultMonth] = useState(null);
  const [formDefaultRow, setFormDefaultRow] = useState(null); // Added state to track the clicked row

  useEffect(() => {
    api.getCampaigns()
      .then(setCampaigns)
      .catch(err => console.error('Failed to fetch campaigns', err));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { 
        setDetailCampaign(null); 
        setFormCampaignId(undefined); 
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filteredCampaigns = useMemo(() => {
    const market = filters.org === 'NZ' ? 'NZ' : 'AU';
    const brandArr = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
    const custArr = Array.isArray(filters.customer) ? filters.customer : [filters.customer];
    const brandAll = brandArr.includes('All') || brandArr.length === 0;
    const custAll = custArr.includes('All') || custArr.length === 0;
  
    return campaigns.filter(c => {
      if (filters.org !== 'AU & NZ' && c.market?.toUpperCase() !== market) return false;
      if (filters.category !== 'All' && c.category !== filters.category) return false;
      if (!brandAll && !brandArr.includes(c.brand)) return false;
      if (!custAll && !custArr.includes(c.customer)) return false;
      return true;
    });
  }, [campaigns, filters]);

  const handleDelete = async (id) => {
    try {
      await api.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSave = async (payload, isNew, campaignId) => {
    try {
      if (isNew) {
        const created = await api.createCampaign(payload);
        setCampaigns(prev => [...prev, created]);
      } else {
        const updated = await api.updateCampaign(campaignId, payload);
        setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
      setFormCampaignId(undefined);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div id="app">
      <TopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        dnOpen={dnOpen} 
        setDnOpen={setDnOpen} 
      />

      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        canEdit={canEdit}
        setCanEdit={setCanEdit}
      />

      <div id="tab-content">
        {activeTab === 'calendar'
          ? <CalendarView campaigns={filteredCampaigns} filters={filters}
              onOpenDetail={setDetailCampaign}
              onOpenForm={v => {
                if (v && typeof v === 'object') { 
                  setFormCampaignId(v.id); 
                  setFormDefaultMonth(v.month);
                  setFormDefaultRow(v.rowKey); // Store row on open
                } else { 
                  setFormCampaignId(v); 
                  setFormDefaultMonth(null); 
                  setFormDefaultRow(null); 
                }
              }}
              onSave={handleSave}
              canEdit={canEdit} />
          : <ToolView campaigns={filteredCampaigns}
              onOpenDetail={setDetailCampaign} onOpenForm={setFormCampaignId} canEdit={canEdit} />
        }
      </div>

      {detailCampaign && (
        <DetailModal campaign={detailCampaign} onClose={() => setDetailCampaign(null)}
          onEdit={(id) => setFormCampaignId(id)} onDelete={handleDelete} canEdit={canEdit} />
      )}

      {formCampaignId !== undefined && (
        <FormModal 
          campaignId={formCampaignId} 
          campaigns={campaigns} 
          defaultMonth={formDefaultMonth}
          defaultRow={formDefaultRow} // Pass row to FormModal
          onClose={() => { 
            setFormCampaignId(undefined); 
            setFormDefaultMonth(null); 
            setFormDefaultRow(null); 
          }} 
          onSave={handleSave} 
        />
      )}

      {dnOpen
        ? <DataNavi campaigns={campaigns} onClose={() => setDnOpen(false)} />
        : <button id="dn-float" onClick={() => setDnOpen(true)}>◈</button>
      }
    </div>
  );
}