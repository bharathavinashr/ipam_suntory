import { useAuth } from '../context/AuthContext';

// LOCAL-mode only: lets a developer pick which registered user to act as, instead of
// a real login. The server never trusts this beyond LOCAL mode — see auth.py.
export default function UserSwitcher() {
  const { authMode, currentUser, allUsers, actAs } = useAuth();

  if (authMode !== 'LOCAL') return null;

  return (
    <div className="user-switcher" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Act as</span>
      <select
        value={currentUser?.email || ''}
        onChange={e => actAs(e.target.value)}
        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#0A1020', color: '#E2E8F0', border: '1px solid #1E293B' }}
      >
        {allUsers.map(u => (
          <option key={u.id} value={u.email}>{u.display_name || u.email} · {u.role_name}</option>
        ))}
      </select>
    </div>
  );
}
