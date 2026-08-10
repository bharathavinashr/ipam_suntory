import { useEffect, useState } from 'react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 0, label: 'System Admin' },
  { value: 1, label: 'User' },
  { value: 2, label: 'Approver' },
  { value: 3, label: 'Viewer' },
];

const emptyForm = { email: '', display_name: '', role: 1 };

export default function UserAdmin({ onClose }) {
  const { allUsers, refreshUsers, currentUser } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refreshUsers().catch(err => setError(err?.detail || 'Failed to load users'));
  }, [refreshUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await usersApi.create(form);
      setForm(emptyForm);
      await refreshUsers();
    } catch (err) {
      setError(err?.detail || 'Failed to create user');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (user, role) => {
    try {
      await usersApi.update(user.id, { ...user, role: Number(role), role_name: null });
      await refreshUsers();
    } catch (err) {
      setError(err?.detail || 'Failed to update role');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersApi.update(user.id, { ...user, is_active: !user.is_active });
      await refreshUsers();
    } catch (err) {
      setError(err?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.email}?`)) return;
    try {
      await usersApi.remove(user.id);
      await refreshUsers();
    } catch (err) {
      setError(err?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="detail-tabs" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '14px 26px' }}>
          <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Jost', Arial, sans-serif" }}>Manage Users</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">
          {error && (
            <div className="content-box" style={{ color: '#B91C1C', background: '#FEF2F2', borderColor: '#FCA5A5', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              required
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="search-input"
              style={{ flex: '1 1 220px' }}
            />
            <input
              placeholder="Display name"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="search-input"
              style={{ flex: '1 1 160px' }}
            />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: Number(e.target.value) }))} className="chip">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button type="submit" className="new-btn" disabled={busy}>➕ Add User</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                <th style={{ padding: '6px 8px' }}>Email</th>
                <th style={{ padding: '6px 8px' }}>Name</th>
                <th style={{ padding: '6px 8px' }}>Role</th>
                <th style={{ padding: '6px 8px' }}>Active</th>
                <th style={{ padding: '6px 8px' }}></th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>{u.email}</td>
                  <td style={{ padding: '8px' }}>{u.display_name || '—'}</td>
                  <td style={{ padding: '8px' }}>
                    <select value={u.role} onChange={e => handleRoleChange(u, e.target.value)} className="chip">
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="checkbox" checked={u.is_active} onChange={() => handleToggleActive(u)} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      className="chip"
                      disabled={u.id === currentUser?.id}
                      title={u.id === currentUser?.id ? "Can't delete your own account" : 'Remove user'}
                      onClick={() => handleDelete(u)}
                    >🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
