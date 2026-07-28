import { ALL_MONTHS, TIERS, CATEGORY_OPTIONS } from '../constants';

const MONTH_INDEX = Object.fromEntries(ALL_MONTHS.map((m, i) => [m.k, i]));

// Greedy interval packing: assigns each campaign to the first lane whose existing
// occupants don't overlap it in time. Shared by row generation (to size Block 3) and by
// CalendarView (to render campaigns within a row) so both use identical overlap logic.
export function packLanes(items) {
  const sorted = [...items].sort((a, b) => a.si - b.si || (b.ei - b.si) - (a.ei - a.si));
  const lanes = [];
  sorted.forEach(item => {
    const lane = lanes.find(l => !l.some(existing => !(item.ei < existing.si || item.si > existing.ei)));
    if (lane) lane.push(item);
    else lanes.push([item]);
  });
  return lanes;
}

function monthSpan(campaign) {
  let si = MONTH_INDEX[campaign.start_month];
  let ei = MONTH_INDEX[campaign.end_month];
  if (si === undefined) si = 0;
  if (ei === undefined) ei = si;
  if (ei < si) ei = si;
  return { si, ei };
}

// A campaign can have multiple channels and multiple accounts selected independently, with
// each account tagged (by FormModal) with the channel(s) it was picked under. Resolve that
// into explicit (channel, account) pairs so e.g. 2 channels + 2 accounts (one picked per
// channel) land the campaign under each correct channel/account row, not just the first of
// each list.
function channelAccountPairs(c) {
  const channels = c.ro_channels || [];
  const accounts = c.ro_accounts || [];

  if (!channels.length) {
    return c.channel ? [{ channel: c.channel, account: c.customer || accounts[0]?.label || '' }] : [];
  }
  if (!accounts.length) {
    return channels.map(ch => ({ channel: ch.label, account: '' }));
  }

  const pairs = [];
  const coveredChannels = new Set();

  accounts.forEach(acc => {
    // Trim defensively — source data has been seen with trailing whitespace on channel
    // names, which would otherwise silently break this match and fall through below.
    const accChannelLabels = (acc.channels || []).map(ch => (ch.label || '').trim());
    const matched = channels.filter(ch => accChannelLabels.includes((ch.label || '').trim()));
    // No (or ambiguous) tag info — e.g. legacy data saved before channel-tagging existed,
    // or a single channel selected — fall back to the first selected channel.
    const targets = matched.length ? matched : [channels[0]];
    targets.forEach(ch => {
      pairs.push({ channel: ch.label, account: acc.label });
      coveredChannels.add(ch.label);
    });
  });

  // A selected channel with no account mapped to it (e.g. 2 channels picked but only 1
  // account chosen) still needs a row — falls back to the channel-level generic slot keyed
  // by Priority Number, same as the "no accounts at all" case above.
  channels.forEach(ch => {
    if (!coveredChannels.has(ch.label)) pairs.push({ channel: ch.label, account: '' });
  });

  return pairs;
}

// Builds the 3 calendar blocks (Category, Priority, Channel & Account) from live campaign
// data instead of a hardcoded row list. A campaign appears in a block purely because its
// fields (campaign_category / tier / channel+account) say so — no manual row bookkeeping.
export function buildDynamicRowGroups(campaigns) {
  const categoryRows = CATEGORY_OPTIONS.map(value => ({
    id: `CAT::${value}`,
    k: `CAT::${value}`,
    l: value,
    section: 'CATEGORY',
    categoryOrChannel: 'CATEGORY',
    rowDetail: value,
    block: 'category',
    value,
    match: (c) => c.campaign_category === value,
  }));

  const priorityRows = Object.keys(TIERS).map(tierName => ({
    id: tierName.toUpperCase(),
    k: tierName.toUpperCase(),
    l: tierName.toUpperCase(),
    section: 'PRIORITY',
    categoryOrChannel: 'PRIORITY',
    rowDetail: tierName.toUpperCase(),
    block: 'priority',
    value: tierName,
    match: (c) => (c.tier || '').toUpperCase() === tierName.toUpperCase(),
  }));

  // channel -> { accounts: Map(account -> campaigns[]), priorityNums: Map(num -> campaigns[]) }
  // A campaign only needs a Channel to land in this block: with an Account picked it's
  // grouped under that account (slots grow on demand); without one, it falls back to its
  // own Priority Number (#1/#2/#3…) as the row — matching the NZ sheet's channel-level
  // generic slots (e.g. ROUTE #1/#2/#3, no named account).
  const channels = new Map();
  campaigns.forEach(c => {
    channelAccountPairs(c).forEach(({ channel, account }) => {
      if (!channel) return;
      if (!channels.has(channel)) channels.set(channel, { accounts: new Map(), priorityNums: new Map() });
      const bucket = channels.get(channel);
      if (account) {
        if (!bucket.accounts.has(account)) bucket.accounts.set(account, []);
        bucket.accounts.get(account).push(c);
      } else if (c.priority_number) {
        if (!bucket.priorityNums.has(c.priority_number)) bucket.priorityNums.set(c.priority_number, []);
        bucket.priorityNums.get(c.priority_number).push(c);
      }
    });
  });

  const channelRows = [];
  [...channels.keys()].sort((a, b) => a.localeCompare(b)).forEach(channel => {
    const { accounts, priorityNums } = channels.get(channel);

    [...priorityNums.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).forEach(num => {
      const camps = priorityNums.get(num);
      const ids = new Set(camps.map(c => c.id));
      channelRows.push({
        id: `CH::${channel}::PN::${num}`,
        k: `CH::${channel}::PN::${num}`,
        l: num,
        section: 'CHANNEL & ACCOUNT',
        categoryOrChannel: channel,
        rowDetail: num,
        block: 'channel',
        channel, account: '', priorityNumber: num,
        match: (c) => ids.has(c.id),
      });
    });

    [...accounts.keys()].sort((a, b) => a.localeCompare(b)).forEach(account => {
      const items = accounts.get(account).map(c => ({ ...monthSpan(c), campaign: c }));
      const lanes = packLanes(items);
      lanes.forEach((lane, laneIdx) => {
        const slot = laneIdx + 1;
        const ids = new Set(lane.map(item => item.campaign.id));
        channelRows.push({
          id: `CH::${channel}::${account}::${slot}`,
          k: `CH::${channel}::${account}::${slot}`,
          l: `${account} #${slot}`,
          section: 'CHANNEL & ACCOUNT',
          categoryOrChannel: channel,
          rowDetail: `${account} #${slot}`,
          block: 'channel',
          channel, account, slot,
          match: (c) => ids.has(c.id),
        });
      });
    });
  });

  return [
    { sec: 'CATEGORY', col: '#94A3B8', rows: categoryRows },
    { sec: 'PRIORITY', col: '#A78BFA', rows: priorityRows },
    { sec: 'CHANNEL & ACCOUNT', col: '#60A5FA', rows: channelRows },
  ];
}
