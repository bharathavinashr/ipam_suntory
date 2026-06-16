export default function TopNav({ activeTab, setActiveTab, canEdit, setCanEdit, dnOpen, setDnOpen }) {
  return (
    <nav id="topnav">
      <div className="logo"><span>◈</span> IPAM<small>Campaign Management</small></div>
      <div className="nav-divider"></div>
      <div className="tab-group">
        <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>▦ Calendar</button>
        <button className={`tab-btn ${activeTab === 'tool' ? 'active' : ''}`} onClick={() => setActiveTab('tool')}>⊞ Campaign Tool</button>
      </div>
      <div className="spacer"></div>
      {/* <div className="proto-badge"><span className="proto-badge-dot"></span>Prototype</div> */}
      <button className={`edit-toggle ${canEdit ? 'on' : ''}`} onClick={() => setCanEdit(!canEdit)}>
        {canEdit ? '✏️ Editing ON' : '🔒 View Only'}
      </button>
      <button className={`datanavi-btn ${dnOpen ? 'open' : ''}`} onClick={() => setDnOpen(!dnOpen)}>
        <span>◈</span> DataNavi
      </button>
    </nav>
  );
}
