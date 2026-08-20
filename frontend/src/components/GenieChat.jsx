import { useState } from 'react';

const GENIE_EMBED_URL = 'https://adb-2205520462893510.10.azuredatabricks.net/embed/genie/rooms/01f19c5597091c0fae65ac0e7a287b10?o=2205520462893510';

export default function GenieChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div id="genie-panel">
          <div className="genie-header">
            <div className="genie-avatar">✦</div>
            <div style={{ flex: 1 }}>
              <div className="genie-name">DataNavi</div>
              <div className="genie-status"><span className="genie-status-dot"></span>Powered by Databricks</div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <iframe
            title="DataNavi"
            src={GENIE_EMBED_URL}
            frameBorder="0"
            allow="clipboard-write"
          />
        </div>
      )}

      <button id="genie-float" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close Genie' : 'Open Genie'}>
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </>
  );
}
