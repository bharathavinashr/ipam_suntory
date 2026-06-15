import { useState, useRef, useEffect } from 'react';
import { fmt } from '../constants';

const INITIAL_MSG = {
  role: 'bot',
  text: "Hi! I'm DataNavi, your IPAM Campaign Assistant. Ask me anything about campaigns, budgets, timelines, or the calendar.\n\nTry: *\"Which campaigns are awaiting approval?\"* or *\"What's our total budget for Alc brands?\"*"
};

export default function DataNavi({ campaigns, onClose }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (q) => {
    const text = (q || input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role:'user', text }]);
    setLoading(true);
    try {
      const ctx = campaigns.map(c =>
        `[${c.id}] ${c.name} | Brand:${c.brand} | Market:${c.market} | Category:${c.category} | Status:${c.status} | Tier:${c.tier} | Budget:${fmt(c.budget)} | Launch:${c.start_month}`
      ).join('\n');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are DataNavi, an expert IPAM Campaign assistant for Suntory Oceania. Answer concisely. Use bullet points for lists. Wrap key terms in *asterisks*.\n\nCAMPAIGN DATA:\n${ctx}`,
          messages: [{ role: 'user', content: text }]
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || '').join('') || 'Sorry, I could not process that.';
      setMessages(m => [...m, { role:'bot', text: reply }]);
    } catch {
      setMessages(m => [...m, { role:'bot', text:'⚠️ Could not connect. Please try again.' }]);
    }
    setLoading(false);
  };

  const renderText = (text) => text
    .replace(/\*([^*]+)\*/g, '<strong style="color:#60A5FA">$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div id="datanavi">
      <div className="dn-header">
        <div className="dn-avatar">◈</div>
        <div style={{ flex:1 }}>
          <div className="dn-name">DataNavi</div>
          <div className="dn-status"><span className="dn-status-dot"></span>Powered by Claude · Campaign-aware AI</div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="dn-messages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`dn-bubble-wrap ${m.role}`}>
            {m.role === 'bot' && <div className="dn-bot-icon">◈</div>}
            <div className={`dn-bubble ${m.role}`} dangerouslySetInnerHTML={{ __html: renderText(m.text) }} />
          </div>
        ))}
        {loading && (
          <div className="dn-typing" style={{ display:'flex' }}>
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      <div className="dn-suggestions">
        {['Budget by tier?','Alc campaigns AU?','Awaiting approval?','Which need review?'].map(s => (
          <button key={s} className="dn-sug" onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="dn-input-row">
        <input className="dn-input" placeholder="Ask about campaigns…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="dn-send" onClick={() => send()} disabled={loading || !input.trim()}>↑</button>
      </div>
    </div>
  );
}
