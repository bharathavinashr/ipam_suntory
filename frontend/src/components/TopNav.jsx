import logoUrl from '../assets/SuntoryOceania-Logo-RGB-Reversed.png';

export default function TopNav({ activeTab, setActiveTab }) {
  return (
    <>
      <div className="logo-header-wrap">
        <header className="logo-header">
          <img src={logoUrl} alt="Suntory Oceania" className="header-logo" />
        </header>
      </div>
      
      <nav id="topnav" className="main-header">
        <div className="header-left">
          <div className="title-with-logo">
            <h1 className="page-title">Campaign Management Tool</h1>
          </div>
        </div>

        {/* Overriding the flex-direction to row so they sit side by side */}
        <div className="header-right" style={{ flexDirection: 'row' }}>
          <button 
            className={`black-icon-btn ${activeTab === 'calendar' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('calendar')}
          >
            <span className="btn-icon">▦</span> Calendar View 
          </button>
          
          <button 
            className={`black-icon-btn ${activeTab === 'tool' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('tool')}
          >
            <span className="btn-icon">⊞</span> Campaign View
          </button>
        </div>
      </nav>
    </>
  );
}