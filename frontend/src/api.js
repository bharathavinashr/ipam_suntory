const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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

export const lookupApi = {
  getDivisions: () =>
    fetch(`${BASE}/lookup/divisions`).then(r => r.json()),
  getCountries: (division) =>
    fetch(`${BASE}/lookup/countries?division=${encodeURIComponent(division)}`).then(r => r.json()),
  getChannels: (country) =>
    fetch(`${BASE}/lookup/channels?country=${encodeURIComponent(country)}`).then(r => r.json()),
  getSubchannels: (country, channelCode = '') => {
    const params = new URLSearchParams({ country });
    if (channelCode) params.set('channel_code', channelCode);
    return fetch(`${BASE}/lookup/subchannels?${params}`).then(r => r.json());
  },
  getAccounts: (country, subchannelCode = '') => {
    const params = new URLSearchParams({ country });
    if (subchannelCode) params.set('subchannel_code', subchannelCode);
    return fetch(`${BASE}/lookup/accounts?${params}`).then(r => r.json());
  },
  getBrands: (division, country) =>
    fetch(`${BASE}/lookup/brands?division=${encodeURIComponent(division)}&country=${encodeURIComponent(country)}`).then(r => r.json()),
  getBrandFamilies: (division, country, brandCodes = []) => {
    const params = new URLSearchParams({ division, country });
    if (brandCodes.length) params.set('brand_codes', brandCodes.join(','));
    return fetch(`${BASE}/lookup/brand-families?${params}`).then(r => r.json());
  },
  getSubchannelDetails: (subchannelCode, country) =>
    fetch(`${BASE}/lookup/subchannel-details?subchannel_code=${encodeURIComponent(subchannelCode)}&country=${encodeURIComponent(country)}`).then(r => r.json()),
  getAccountDetails: (accountCode, country) =>
    fetch(`${BASE}/lookup/account-details?account_code=${encodeURIComponent(accountCode)}&country=${encodeURIComponent(country)}`).then(r => r.json()),
  getBrandFamilyDetails: (brandFamilyCode, country, division) =>
    fetch(`${BASE}/lookup/brand-family-details?brand_family_code=${encodeURIComponent(brandFamilyCode)}&country=${encodeURIComponent(country)}&division=${encodeURIComponent(division)}`).then(r => r.json()),
};
