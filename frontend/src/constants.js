export const BRAND_CFG = {
  // 100% Solid Base Colors
  "V Energy":           { bg:"#0ECC73", bdr:"#0ECC73", txt:"#000", dot:"#0ECC73" },
  "Suntory BOSS Coffee":{ bg:"#004A79", bdr:"#004A79", txt:"#FFFFFF", dot:"#004A79" },
  "Ribena":             { bg:"#00325D", bdr:"#00325D", txt:"#FFFFFF", dot:"#00325D" },
  "Celsius":            { bg:"#18E3D3", bdr:"#18E3D3", txt:"#000", dot:"#18E3D3" },
  "Pepsi":              { bg:"#18E3D3", bdr:"#18E3D3", txt:"#000", dot:"#18E3D3" },
  
  // 50% Tint/Opacity Colors (80 hex)
  "Gatorade":           { bg:"#4AD996", bdr:"#4AD996", txt:"#000", dot:"#4AD996" },
  "UP&GO":              { bg:"#004A7980", bdr:"#004A7980", txt:"#FFFFFF", dot:"#004A79" },
  "Suntory -196":       { bg:"#52EBDE", bdr:"#52EBDE", txt:"#000", dot:"#52EBDE" },
  "Jim Beam":           { bg:"#666B6E80", bdr:"#666B6E80", txt:"#FFFFFF", dot:"#666B6E" },
  "Canadian Club":      { bg:"#52EBDE", bdr:"#52EBDE", txt:"#000", dot:"#52EBDE" },

  // 25% Tint/Opacity Colors (40 hex)
  "Yamazaki":           { bg:"#87E6B9", bdr:"#87E6B9", txt:"#000", dot:"#87E6B9" },
  "Roku":               { bg:"#8CF2E9", bdr:"#8CF2E9", txt:"#000", dot:"#8CF2E9" },
  "Maximus":            { bg:"#8CF2E9", bdr:"#0038CF2E925D40", txt:"#000", dot:"#8CF2E9" },
  
  // Default Fallback
  "default":            { bg:"#64748B", bdr:"#64748B", txt:"#FFFFFF", dot:"#64748B" },
};

export const TIERS = {
  Platinum: { w: 1000, acc: "#F5C842" },
  Gold:     { w: 700,  acc: "#FFD700" },
  Silver:   { w: 300,  acc: "#C0C8D8" },
  Bronze:   { w: 50,   acc: "#D4945A" },
};

// Category dropdown shown below Country on the campaign form; also drives the calendar's
// Category block (one row per option). Add new options here to get a new row for free.
export const CATEGORY_OPTIONS = ["NDP"];

export const STATUS_COL = {
  "Draft": "#6B7280",
  "In Discussion": "#8B5CF6",
  "In Progress": "#3B82F6",
  "Awaiting Approval": "#F59E0B",
  "Approved": "#10B981",
  "Published": "#06B6D4",
};

export const PERIODS = [
  { q:"Q3 2026", months:[{k:"jul26",l:"J",f:"Jul 26"},{k:"aug26",l:"A",f:"Aug 26"},{k:"sep26",l:"S",f:"Sep 26"}] },
  { q:"Q4 2026", months:[{k:"oct26",l:"O",f:"Oct 26"},{k:"nov26",l:"N",f:"Nov 26"},{k:"dec26",l:"D",f:"Dec 26"}] },
  { q:"Q1 2027", months:[{k:"jan27",l:"J",f:"Jan 27"},{k:"feb27",l:"F",f:"Feb 27"},{k:"mar27",l:"M",f:"Mar 27"}] },
  { q:"Q2 2027", months:[{k:"apr27",l:"A",f:"Apr 27"},{k:"may27",l:"M",f:"May 27"},{k:"jun27",l:"J",f:"Jun 27"}] },
  { q:"Q3 2027", months:[{k:"jul27",l:"J",f:"Jul 27"},{k:"aug27",l:"A",f:"Aug 27"},{k:"sep27",l:"S",f:"Sep 27"}] },
  { q:"Q4 2027", months:[{k:"oct27",l:"O",f:"Oct 27"},{k:"nov27",l:"N",f:"Nov 27"},{k:"dec27",l:"D",f:"Dec 27"}] },
];

export const ALL_MONTHS = PERIODS.flatMap(p => p.months);

// Unified 3-column left header for the calendar table — same for AU and NZ since both
// now render the same dynamic 3-block model (see lib/calendarBlocks.js).
export const CALENDAR_LEFT_COLUMNS = [
  { key: 'section', label: 'Block' },
  { key: 'categoryOrChannel', label: 'Category / Channel' },
  { key: 'rowDetail', label: 'Row / Detail' },
];

export const getCalendarLeftColumns = () => CALENDAR_LEFT_COLUMNS;

export const PERSONAS = [
  { role:"Shopper Marketing / Activation", icon:"🛍", color:"#8B5CF6", desc:"Owns calendar; daily usage.", access:"Edit" },
  { role:"Brand Team", icon:"🎨", color:"#EC4899", desc:"Inputs NPD; co-authors briefs.", access:"Edit" },
  { role:"Category Team", icon:"📊", color:"#3B82F6", desc:"Planning & downstream processes.", access:"Read" },
  { role:"Commercial / Sales / Field", icon:"🚗", color:"#10B981", desc:"Consumes views; provides field feedback.", access:"Read" },
  { role:"Finance / Approvers", icon:"✅", color:"#F59E0B", desc:"DocuSign approvals & budget sign-off.", access:"Approve" },
  { role:"Key Customers / Retailers", icon:"🏪", color:"#06B6D4", desc:"Forward plans via annual collab.", access:"View" },
];

export const bc = (name) => BRAND_CFG[name] || BRAND_CFG.default;
export const tierAcc = (t) => (TIERS[t] || TIERS.Silver).acc;
export const statusCol = (s) => STATUS_COL[s] || '#6B7280';
export const fmt = (n) => n >= 1000000 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

