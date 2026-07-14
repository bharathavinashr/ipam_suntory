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
  "default":            { bg:"#C5F8F4", bdr:"#C5F8F4", txt:"#FFFFFF", dot:"#C5F8F4" },
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

export const CALENDAR_LEFT_COLUMNS = {
  AU: [
    { key: 'section', label: 'Section' },
    { key: 'categoryOrChannel', label: 'Category / Channel' },
    { key: 'rowDetail', label: 'Row / Detail' },
  ],
  NZ: [
    { key: 'section', label: 'Section' },
    { key: 'rowDetail', label: 'Row' },
  ],
};

export const getCalendarLeftColumns = (country) => CALENDAR_LEFT_COLUMNS[country === 'NZ' ? 'NZ' : 'AU'];

export const CALENDAR_ROW_GROUPS = {
  AU: [
    {
      sec: 'TOTAL BUSINESS',
      col: '#94A3B8',
      rows: [
        { id: 'CBI', k: 'CBI', l: 'CBI', section: 'TOTAL BUSINESS', categoryOrChannel: 'CBI', rowDetail: 'CBI' },
        { id: 'NPD1', k: 'NPD1', l: '1ST TO MARKET ACTIVATION PERIOD', section: 'TOTAL BUSINESS', categoryOrChannel: 'NPD', rowDetail: '1ST TO MARKET ACTIVATION PERIOD' },
        { id: 'NPD2', k: 'NPD2', l: 'FIRST ORDER DATES', section: 'TOTAL BUSINESS', categoryOrChannel: 'NPD', rowDetail: 'FIRST ORDER DATES' },
        { id: 'NPD3', k: 'NPD3', l: 'REST OF MARKET ACTIVATION MONTH', section: 'TOTAL BUSINESS', categoryOrChannel: 'NPD', rowDetail: 'REST OF MARKET ACTIVATION MONTH' },
        { id: 'IAP_MONTHLY_BRAND_FOCUS', k: 'IAP_MONTHLY_BRAND_FOCUS', l: 'IAP MONTHLY BRAND FOCUS', section: 'TOTAL BUSINESS', categoryOrChannel: 'IAP MONTHLY BRAND FOCUS', rowDetail: 'IAP MONTHLY BRAND FOCUS' },
        { id: 'PLATINUM', k: 'PLATINUM', l: 'PLATINUM', section: 'TOTAL BUSINESS', categoryOrChannel: 'ACTIVATION PERIOD - PRIORITY', rowDetail: 'PLATINUM' },
        { id: 'GOLD', k: 'GOLD', l: 'GOLD', section: 'TOTAL BUSINESS', categoryOrChannel: 'ACTIVATION PERIOD - PRIORITY', rowDetail: 'GOLD' },
        { id: 'SILVER', k: 'SILVER', l: 'SILVER', section: 'TOTAL BUSINESS', categoryOrChannel: 'ACTIVATION PERIOD - PRIORITY', rowDetail: 'SILVER' },
        { id: 'BRONZE', k: 'BRONZE', l: 'BRONZE', section: 'TOTAL BUSINESS', categoryOrChannel: 'ACTIVATION PERIOD - PRIORITY', rowDetail: 'BRONZE' },
      ],
    },
    {
      sec: 'CHANNEL & CUSTOMER ACTIVATION PLAN',
      col: '#60A5FA',
      rows: [
        { id: 'ROUTE1', k: 'ROUTE1', l: '#1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'ROUTE & UNSTRUCTURED', rowDetail: '#1' },
        { id: 'ROUTE2', k: 'ROUTE2', l: '#2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'ROUTE & UNSTRUCTURED', rowDetail: '#2' },
        { id: 'ROUTE3', k: 'ROUTE3', l: '#3', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'ROUTE & UNSTRUCTURED', rowDetail: '#3' },
        { id: 'ROUTE_TOWER', k: 'ROUTE_TOWER', l: 'TOWER PRIORITY (Commercial)', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'ROUTE & UNSTRUCTURED', rowDetail: 'TOWER PRIORITY (Commercial)' },
        { id: 'GROCERY_WW1', k: 'GROCERY_WW1', l: 'WOOLWORTHS #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'WOOLWORTHS #1' },
        { id: 'GROCERY_WW2', k: 'GROCERY_WW2', l: 'WOOLWORTHS #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'WOOLWORTHS #2' },
        { id: 'GROCERY_COLES1', k: 'GROCERY_COLES1', l: 'COLES #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'COLES #1' },
        { id: 'GROCERY_COLES2', k: 'GROCERY_COLES2', l: 'COLES #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'COLES #2' },
        { id: 'GROCERY_METCASH1', k: 'GROCERY_METCASH1', l: 'METCASH /MSO #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'METCASH /MSO #1' },
        { id: 'GROCERY_METCASH2', k: 'GROCERY_METCASH2', l: 'METCASH /MSO #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'METCASH /MSO #2' },
        { id: 'GROCERY_CUP', k: 'GROCERY_CUP', l: 'METCASH SUNTORY CUP PERIODS', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'GROCERY - CATEGORIES', rowDetail: 'METCASH SUNTORY CUP PERIODS' },
        { id: 'PANDC_711_1', k: 'PANDC_711_1', l: '711 #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: '711 #1' },
        { id: 'PANDC_711_2', k: 'PANDC_711_2', l: '711 #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: '711 #2' },
        { id: 'PANDC_AMPOL_1', k: 'PANDC_AMPOL_1', l: 'AMPOL #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'AMPOL #1' },
        { id: 'PANDC_AMPOL_2', k: 'PANDC_AMPOL_2', l: 'AMPOL #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'AMPOL #2' },
        { id: 'PANDC_REDDY_1', k: 'PANDC_REDDY_1', l: 'REDDY/OTR GROUP #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'REDDY/OTR GROUP #1' },
        { id: 'PANDC_REDDY_2', k: 'PANDC_REDDY_2', l: 'REDDY/OTR GROUP #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'REDDY/OTR GROUP #2' },
        { id: 'PANDC_BP_1', k: 'PANDC_BP_1', l: 'BP COCO #1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'BP COCO #1' },
        { id: 'PANDC_BP_2', k: 'PANDC_BP_2', l: 'BP COCO #2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS MAJORS PRIORTIES', rowDetail: 'BP COCO #2' },
        { id: 'PANDC_TIER2_EG1', k: 'PANDC_TIER2_EG1', l: 'EG # 1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'EG # 1' },
        { id: 'PANDC_TIER2_EG2', k: 'PANDC_TIER2_EG2', l: 'EG # 2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'EG # 2' },
        { id: 'PANDC_TIER2_NIGHTOWL1', k: 'PANDC_TIER2_NIGHTOWL1', l: 'NIGHTOWL # 1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'NIGHTOWL # 1' },
        { id: 'PANDC_TIER2_NIGHTOWL2', k: 'PANDC_TIER2_NIGHTOWL2', l: 'NIGHTOWL # 2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'NIGHTOWL # 2' },
        { id: 'PANDC_TIER2_METRO1', k: 'PANDC_TIER2_METRO1', l: 'METRO # 1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'METRO # 1' },
        { id: 'PANDC_TIER2_METRO2', k: 'PANDC_TIER2_METRO2', l: 'METRO # 2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'METRO # 2' },
        { id: 'PANDC_TIER2_UCB1', k: 'PANDC_TIER2_UCB1', l: 'UCB # 1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'UCB # 1' },
        { id: 'PANDC_TIER2_UCB2', k: 'PANDC_TIER2_UCB2', l: 'UCB # 2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'UCB # 2' },
        { id: 'PANDC_TIER2_NSG1', k: 'PANDC_TIER2_NSG1', l: 'NSG # 1', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'NSG # 1' },
        { id: 'PANDC_TIER2_NSG2', k: 'PANDC_TIER2_NSG2', l: 'NSG # 2', section: 'CHANNEL & CUSTOMER ACTIVATION PLAN', categoryOrChannel: 'P&C/OILS TIER 2 PRIORITIES', rowDetail: 'NSG # 2' },
      ],
    },
  ],
  NZ: [
    { sec: 'CBI', col: '#94A3B8', rows: [{ id: 'NZ_CBI', k: 'CBI', l: 'CBI', section: 'CBI', rowDetail: 'CBI' }] },
    { sec: 'NPD', col: '#60A5FA', rows: [{ id: 'NZ_NPD', k: 'NPD', l: 'NPD', section: 'NPD', rowDetail: 'NPD' }] },
    { sec: 'PRIORITY', col: '#A78BFA', rows: [
      { id: 'NZ_PLATINUM', k: 'PLATINUM', l: 'PLATINUM', section: 'PRIORITY', rowDetail: 'PLATINUM' },
      { id: 'NZ_GOLD', k: 'GOLD', l: 'GOLD', section: 'PRIORITY', rowDetail: 'GOLD' },
      { id: 'NZ_SILVER', k: 'SILVER', l: 'SILVER', section: 'PRIORITY', rowDetail: 'SILVER' },
      { id: 'NZ_BRONZE', k: 'BRONZE', l: 'BRONZE', section: 'PRIORITY', rowDetail: 'BRONZE' },
    ] },
    { sec: 'ROUTE', col: '#F87171', rows: [
      { id: 'NZ_ROUTE1', k: 'ROUTE1', l: '#1', section: 'ROUTE', rowDetail: '#1' },
      { id: 'NZ_ROUTE2', k: 'ROUTE2', l: '#2', section: 'ROUTE', rowDetail: '#2' },
      { id: 'NZ_ROUTE3', k: 'ROUTE3', l: '#3', section: 'ROUTE', rowDetail: '#3' },
    ] },
    { sec: 'P&C', col: '#F59E0B', rows: [
      { id: 'NZ_PC1', k: 'PC1', l: '#1', section: 'P&C', rowDetail: '#1' },
      { id: 'NZ_PC2', k: 'PC2', l: '#2', section: 'P&C', rowDetail: '#2' },
      { id: 'NZ_PC3', k: 'PC3', l: '#3', section: 'P&C', rowDetail: '#3' },
    ] },
    { sec: 'GROCERY WW', col: '#10B981', rows: [
      { id: 'NZ_GROCERY_WW1', k: 'GROCERY_WW1', l: '#1', section: 'GROCERY WW', rowDetail: '#1' },
      { id: 'NZ_GROCERY_WW2', k: 'GROCERY_WW2', l: '#2', section: 'GROCERY WW', rowDetail: '#2' },
      { id: 'NZ_GROCERY_WW3', k: 'GROCERY_WW3', l: '#3', section: 'GROCERY WW', rowDetail: '#3' },
      { id: 'NZ_GROCERY_WW_RETAILER', k: 'GROCERY_WW_RETAILER', l: 'RETAILER PROGRAMS', section: 'GROCERY WW', rowDetail: 'RETAILER PROGRAMS' },
    ] },
    { sec: 'GROCERY FS', col: '#3B82F6', rows: [
      { id: 'NZ_GROCERY_FS1', k: 'GROCERY_FS1', l: '#1', section: 'GROCERY FS', rowDetail: '#1' },
      { id: 'NZ_GROCERY_FS2', k: 'GROCERY_FS2', l: '#2', section: 'GROCERY FS', rowDetail: '#2' },
      { id: 'NZ_GROCERY_FS3', k: 'GROCERY_FS3', l: '#3', section: 'GROCERY FS', rowDetail: '#3' },
      { id: 'NZ_GROCERY_FS_RETAILER', k: 'GROCERY_FS_RETAILER', l: 'RETAILER PROGRAMS', section: 'GROCERY FS', rowDetail: 'RETAILER PROGRAMS' },
    ] },
  ],
};

export const getCalendarRowGroups = (country) => CALENDAR_ROW_GROUPS[country === 'NZ' ? 'NZ' : 'AU'];
export const ROW_GROUPS = CALENDAR_ROW_GROUPS.AU;
export const ALL_ROWS = [...CALENDAR_ROW_GROUPS.AU.flatMap(group => group.rows), ...CALENDAR_ROW_GROUPS.NZ.flatMap(group => group.rows)];

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