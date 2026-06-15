const BASE = 'http://localhost:8000/api';

export const api = {
  getCampaigns: () => fetch(`${BASE}/campaigns`).then(r => r.json()),
  getCampaign: (id) => fetch(`${BASE}/campaigns/${id}`).then(r => r.json()),
  createCampaign: (data) => fetch(`${BASE}/campaigns`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(r => r.json()),
  updateCampaign: (id, data) => fetch(`${BASE}/campaigns/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(r => r.json()),
  deleteCampaign: (id) => fetch(`${BASE}/campaigns/${id}`, { method: 'DELETE' }).then(r => r.json()),
};
