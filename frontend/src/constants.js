export const BRANDS_AU_NONALC = ["V Energy","Suntory BOSS Coffee","Maximus","Ribena","Celsius","Pepsi","Gatorade","UP&GO","Lucozade","Rockstar"];
export const BRANDS_NZ_NONALC = ["V Energy","Suntory BOSS Coffee","Maximus","Ribena","The Real McCoy","Just Juice","Fresh Up","NZ Natural","h2go","Mizone","G Force","UP&GO","Lucozade","Pepsi","Pepsi Max","7UP","Mountain Dew","Gatorade","Rockstar","Celsius"];
export const BRANDS_AU_ALC = ["Suntory -196","Jim Beam","Maker's Mark","Basil Hayden's","Baker's","Legent","Booker's","Knob Creek","Larios","Yamazaki","Hakushu","Hibiki","Haku","Bowmore","Laphroaig","Ardmore","Auchentoshan","Connemara","Galliano","Cruzan","Chita","Canadian Club","Paraiso","Pavan","Roku","Sipsmith","Sourz","Teacher's"];
export const BRANDS_NZ_ALC = ["Suntory -196","Jim Beam","Maker's Mark","Basil Hayden's","Baker's","Legent","Booker's","Knob Creek","Larios","Yamazaki","Hakushu","Hibiki","Haku","Bowmore","Laphroaig","Ardmore","Auchentoshan","Connemara","Galliano","Cruzan","Chita","Canadian Club","Paraiso","Pavan","Roku","Sipsmith","Sourz","Stolen","Chatelle","Old Crow","Teacher's"];
export const CUSTS_NONALC = ["All Customers","Coles Supermarket","Woolworths Supermarket","IGA","7-Eleven","Ampol","BP","EasyMart"];
export const CUSTS_ALC = ["All Customers","Dan Murphy's","BWS","Liquorland","Cellarbrations","Bottle-O","Bottlemart"];

export const BRAND_CFG = {
  // 100% Solid Base Colors
  "V Energy":           { bg:"#0ECC73", bdr:"#0ECC73", txt:"#000", dot:"#0ECC73" },
  "Suntory BOSS Coffee":{ bg:"#004A79", bdr:"#004A79", txt:"#FFFFFF", dot:"#004A79" },
  "Ribena":             { bg:"#00325D", bdr:"#00325D", txt:"#FFFFFF", dot:"#00325D" },
  "Celsius":            { bg:"#666B6E", bdr:"#666B6E", txt:"#FFFFFF", dot:"#666B6E" },
  "Pepsi":              { bg:"#3E3A39", bdr:"#3E3A39", txt:"#FFFFFF", dot:"#3E3A39" },
  
  // 50% Tint/Opacity Colors (80 hex)
  "Gatorade":           { bg:"#4AD996", bdr:"#4AD996", txt:"#000", dot:"#4AD996" },
  "UP&GO":              { bg:"#004A7980", bdr:"#004A7980", txt:"#FFFFFF", dot:"#004A79" },
  "Suntory -196":       { bg:"#00325D80", bdr:"#00325D80", txt:"#FFFFFF", dot:"#00325D" },
  "Jim Beam":           { bg:"#666B6E80", bdr:"#666B6E80", txt:"#FFFFFF", dot:"#666B6E" },
  "Canadian Club":      { bg:"#3E3A3980", bdr:"#3E3A3980", txt:"#FFFFFF", dot:"#3E3A39" },

  // 25% Tint/Opacity Colors (40 hex)
  "Yamazaki":           { bg:"#87E6B9", bdr:"#87E6B9", txt:"#000", dot:"#87E6B9" },
  "Roku":               { bg:"#004A7940", bdr:"#004A7940", txt:"#FFFFFF", dot:"#004A79" },
  "Maximus":            { bg:"#00325D40", bdr:"#00325D40", txt:"#FFFFFF", dot:"#00325D" },
  
  // Default Fallback
  "default":            { bg:"#666B6E40", bdr:"#666B6E40", txt:"#FFFFFF", dot:"#666B6E" },
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
  if (org === 'AU & NZ' || org === 'AU') {
    if (isAll || category === 'Non-Alc') sets.push(...BRANDS_AU_NONALC);
    if (isAll || category === 'Alc') sets.push(...BRANDS_AU_ALC);
  }
  if (org === 'AU & NZ' || org === 'NZ') {
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