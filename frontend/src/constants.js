export const BRANDS_AU_NONALC = ["V Energy","Suntory BOSS Coffee","Maximus","Ribena","Celsius","Pepsi","Gatorade","UP&GO","Lucozade","Rockstar"];
export const BRANDS_NZ_NONALC = ["V Energy","Suntory BOSS Coffee","Maximus","Ribena","The Real McCoy","Just Juice","Fresh Up","NZ Natural","h2go","Mizone","G Force","UP&GO","Lucozade","Pepsi","Pepsi Max","7UP","Mountain Dew","Gatorade","Rockstar","Celsius"];
export const BRANDS_AU_ALC = ["Suntory -196","Jim Beam","Maker's Mark","Basil Hayden's","Baker's","Legent","Booker's","Knob Creek","Larios","Yamazaki","Hakushu","Hibiki","Haku","Bowmore","Laphroaig","Ardmore","Auchentoshan","Connemara","Galliano","Cruzan","Chita","Canadian Club","Paraiso","Pavan","Roku","Sipsmith","Sourz","Teacher's"];
export const BRANDS_NZ_ALC = ["Suntory -196","Jim Beam","Maker's Mark","Basil Hayden's","Baker's","Legent","Booker's","Knob Creek","Larios","Yamazaki","Hakushu","Hibiki","Haku","Bowmore","Laphroaig","Ardmore","Auchentoshan","Connemara","Galliano","Cruzan","Chita","Canadian Club","Paraiso","Pavan","Roku","Sipsmith","Sourz","Stolen","Chatelle","Old Crow","Teacher's"];
export const CUSTS_NONALC = ["All Customers","Coles Supermarket","Woolworths Supermarket","IGA","7-Eleven","Ampol","BP","EasyMart"];
export const CUSTS_ALC = ["All Customers","Dan Murphy's","BWS","Liquorland","Cellarbrations","Bottle-O","Bottlemart"];

export const BRAND_CFG = {
  "V Energy":           { bg:"#1A3A0A", bdr:"#365314", txt:"#ECFCCB", dot:"#A3E635" },
  "Suntory BOSS Coffee":{ bg:"#3B1F0A", bdr:"#78350F", txt:"#FEF3C7", dot:"#FBBF24" },
  "Ribena":             { bg:"#581C87", bdr:"#7E22CE", txt:"#F3E8FF", dot:"#A855F7" },
  "Celsius":            { bg:"#14532D", bdr:"#166534", txt:"#D1FAE5", dot:"#34D399" },
  "Pepsi":              { bg:"#1E3A8A", bdr:"#1D4ED8", txt:"#DBEAFE", dot:"#60A5FA" },
  "Gatorade":           { bg:"#134E4A", bdr:"#0F766E", txt:"#CCFBF1", dot:"#2DD4BF" },
  "UP&GO":              { bg:"#7C2D12", bdr:"#C2410C", txt:"#FED7AA", dot:"#FB923C" },
  "Suntory -196":       { bg:"#4A1D7A", bdr:"#6B2FA0", txt:"#F3E8FF", dot:"#C084FC" },
  "Jim Beam":           { bg:"#422006", bdr:"#7C3306", txt:"#FEF3C7", dot:"#D97706" },
  "Canadian Club":      { bg:"#3D1F06", bdr:"#92400E", txt:"#FEF3C7", dot:"#F59E0B" },
  "Yamazaki":           { bg:"#2D1B00", bdr:"#713F12", txt:"#FEF3C7", dot:"#EAB308" },
  "Roku":               { bg:"#052E16", bdr:"#065F46", txt:"#D1FAE5", dot:"#10B981" },
  "Maximus":            { bg:"#1E293B", bdr:"#334155", txt:"#CBD5E1", dot:"#94A3B8" },
  "default":            { bg:"#1E293B", bdr:"#334155", txt:"#CBD5E1", dot:"#94A3B8" },
};

export const TIERS = {
  Platinum: { w: 1000, acc: "#F5C842" },
  Gold:     { w: 700,  acc: "#FFD700" },
  Silver:   { w: 300,  acc: "#C0C8D8" },
  Bronze:   { w: 50,   acc: "#D4945A" },
};

export const STATUS_COL = {
  "Draft": "#6B7280",
  "In Discussion": "#8B5CF6",
  "In Progress": "#3B82F6",
  "Awaiting Approval": "#F59E0B",
  "Approved": "#10B981",
  "Published": "#06B6D4",
};

export const PERIODS = [
  { q:"Q2 2026", months:[{k:"may26",l:"M",f:"May 26"},{k:"jun26",l:"J",f:"Jun 26"}] },
  { q:"Q3 2026", months:[{k:"jul26",l:"J",f:"Jul 26"},{k:"aug26",l:"A",f:"Aug 26"},{k:"sep26",l:"S",f:"Sep 26"}] },
  { q:"Q4 2026", months:[{k:"oct26",l:"O",f:"Oct 26"},{k:"nov26",l:"N",f:"Nov 26"},{k:"dec26",l:"D",f:"Dec 26"}] },
  { q:"Q1 2027", months:[{k:"jan27",l:"J",f:"Jan 27"},{k:"feb27",l:"F",f:"Feb 27"},{k:"mar27",l:"M",f:"Mar 27"}] },
  { q:"Q2 2027", months:[{k:"apr27",l:"A",f:"Apr 27"},{k:"may27",l:"M",f:"May 27"},{k:"jun27",l:"J",f:"Jun 27"}] },
  { q:"Q3 2027", months:[{k:"jul27",l:"J",f:"Jul 27"},{k:"aug27",l:"A",f:"Aug 27"},{k:"sep27",l:"S",f:"Sep 27"}] },
];

export const ALL_MONTHS = PERIODS.flatMap(p => p.months);

export const ROW_GROUPS = [
  { sec:"CBI",      col:"#94A3B8", rows:[{k:"CBI",      l:"CBI"}] },
  { sec:"NPD",      col:"#60A5FA", rows:[{k:"NPD1",     l:"NPD 1"},{k:"NPD2",l:"NPD 2"},{k:"NPD3",l:"NPD 3"}] },
  { sec:"PRIORITY", col:"#A78BFA", rows:[{k:"PLATINUM", l:"PLATINUM"},{k:"GOLD",l:"GOLD"},{k:"SILVER",l:"SILVER"},{k:"BRONZE",l:"BRONZE"}] },
  { sec:"ROUTE",    col:"#F87171", rows:[{k:"ROUTE1",   l:"#1"},{k:"ROUTE2",l:"#2"},{k:"ROUTE3",l:"#3"}] },
];

export const ALL_ROWS = ROW_GROUPS.flatMap(g => g.rows);

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

export const getActiveBrands = (org, category) => {
  let sets = [];
  const isAll = !category || category === 'All';
  if (org === 'Suntory Oceania' || org === 'AU') {
    if (isAll || category === 'Non-Alc') sets.push(...BRANDS_AU_NONALC);
    if (isAll || category === 'Alc') sets.push(...BRANDS_AU_ALC);
  }
  if (org === 'Suntory Oceania' || org === 'NZ') {
    if (isAll || category === 'Non-Alc') sets.push(...BRANDS_NZ_NONALC);
    if (isAll || category === 'Alc') sets.push(...BRANDS_NZ_ALC);
  }
  return ['All', ...new Set(sets)];
};

export const getActiveCustomers = (category) => {
  if (category === 'Alc') return CUSTS_ALC;
  if (category === 'Non-Alc') return CUSTS_NONALC;
  return [...new Set([...CUSTS_NONALC, ...CUSTS_ALC])];
};
