const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// LOCAL-mode dev convenience only: the "act as <email>" picker stores its choice here so
// api.js (a plain module, outside React) can attach it to requests. In deployed mode this
// is never read server-side — identity there comes from the platform's forwarded-auth header.
const ACTING_EMAIL_KEY = 'ipam_acting_email';

export function setActingEmail(email) {
  if (email) localStorage.setItem(ACTING_EMAIL_KEY, email);
  else localStorage.removeItem(ACTING_EMAIL_KEY);
}

function authHeaders() {
  const email = localStorage.getItem(ACTING_EMAIL_KEY);
  return email ? { 'X-Impersonate-Email': email } : {};
}

async function asJson(r) {
  const body = await r.json().catch(() => null);
  if (!r.ok) throw body || { detail: r.statusText };
  return body;
}

export const api = {
  getCampaigns: () => fetch(`${BASE}/campaigns`).then(asJson),
  getCampaign: (id) => fetch(`${BASE}/campaigns/${id}`).then(asJson),
  createCampaign: (data) => fetch(`${BASE}/campaigns`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data)
  }).then(asJson),
  updateCampaign: (id, data) => fetch(`${BASE}/campaigns/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data)
  }).then(asJson),
  deleteCampaign: (id) => fetch(`${BASE}/campaigns/${id}`, { method: 'DELETE', headers: authHeaders() }).then(asJson),
};

export const attachmentsApi = {
  list: (campaignId) => fetch(`${BASE}/campaigns/${campaignId}/attachments`).then(asJson),
  upload: (campaignId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE}/campaigns/${campaignId}/attachments`, {
      method: 'POST', headers: authHeaders(), body: formData
    }).then(asJson);
  },
  rename: (campaignId, attachmentId, filename) => fetch(`${BASE}/campaigns/${campaignId}/attachments/${attachmentId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ filename })
  }).then(asJson),
  remove: (campaignId, attachmentId) => fetch(`${BASE}/campaigns/${campaignId}/attachments/${attachmentId}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(asJson),
  downloadUrl: (campaignId, attachmentId) => `${BASE}/campaigns/${campaignId}/attachments/${attachmentId}/download`,
};

export const authApi = {
  getConfig: () => fetch(`${BASE}/auth/config`).then(asJson),
  getMe: () => fetch(`${BASE}/auth/me`, { headers: authHeaders() }).then(asJson),
};

export const usersApi = {
  list: () => fetch(`${BASE}/users`, { headers: authHeaders() }).then(asJson),
  create: (data) => fetch(`${BASE}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data)
  }).then(asJson),
  update: (id, data) => fetch(`${BASE}/users/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data)
  }).then(asJson),
  remove: (id) => fetch(`${BASE}/users/${id}`, { method: 'DELETE', headers: authHeaders() }).then(asJson),
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
  getAccounts: (country, channelCode = '', subchannelCode = '') => {
    const params = new URLSearchParams({ country });
    if (channelCode) params.set('channel_code', channelCode);
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
