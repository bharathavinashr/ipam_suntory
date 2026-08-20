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

const MONTH_ABBR = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const MONTH_LETTER = ['J','F','M','A','M','J','J','A','S','O','N','D'];
const MONTH_TITLE = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthEntry(year, monthIdx) {
  const yy = String(year).slice(-2);
  return { k: `${MONTH_ABBR[monthIdx]}${yy}`, l: MONTH_LETTER[monthIdx], f: `${MONTH_TITLE[monthIdx]} ${yy}` };
}

// Generates one PERIODS-shaped entry per quarter from (fromYear,fromQ) to (toYear,toQ)
// inclusive, where q is 0-indexed (0 = Q1 .. 3 = Q4).
function quartersInRange(fromYear, fromQ, toYear, toQ) {
  const out = [];
  let y = fromYear, q = fromQ;
  while (y < toYear || (y === toYear && q <= toQ)) {
    out.push({ q: `Q${q + 1} ${y}`, months: [0, 1, 2].map(off => monthEntry(y, q * 3 + off)) });
    q++;
    if (q > 3) { q = 0; y++; }
  }
  return out;
}

function monthKeyToYearQuarter(key) {
  const abbr = (key || '').slice(0, 3).toLowerCase();
  const yy = (key || '').slice(3, 5);
  const monthIdx = MONTH_ABBR.indexOf(abbr);
  if (monthIdx === -1 || yy.length !== 2 || isNaN(yy)) return null;
  return { year: 2000 + parseInt(yy, 10), q: Math.floor(monthIdx / 3) };
}

// Default visible range when no campaign data pushes it wider.
const DEFAULT_RANGE_START = { year: 2026, q: 2 }; // Q3 2026
const DEFAULT_RANGE_END = { year: 2027, q: 3 };   // Q4 2027

// Builds the calendar's quarter/month headers from live campaign data instead of a fixed
// window, so a backfilled campaign outside the default range (e.g. a 20-Jan-2026 start
// date) grows the calendar to include Q1 2026 rather than being silently unrenderable.
export function buildPeriods(campaigns = []) {
  let earliest = DEFAULT_RANGE_START;
  let latest = DEFAULT_RANGE_END;

  campaigns.forEach(c => {
    [c.start_month, c.end_month].forEach(key => {
      const yq = monthKeyToYearQuarter(key);
      if (!yq) return;
      if (yq.year < earliest.year || (yq.year === earliest.year && yq.q < earliest.q)) earliest = yq;
      if (yq.year > latest.year || (yq.year === latest.year && yq.q > latest.q)) latest = yq;
    });
  });

  return quartersInRange(earliest.year, earliest.q, latest.year, latest.q);
}

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

