'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('user');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [creating, setCreating] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch('/api/users/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);
    setCreating(true);

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, email: createEmail, password: createPassword, role: createRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create user');
        return;
      }

      setCreateSuccess(true);
      setShowCreateModal(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('guest');
      fetchUsers();
      setTimeout(() => {
        setCreateSuccess(false);
      }, 2000);
    } catch {
      setCreateError('Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb]"
          >
            Create User
          </button>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          {passwordError && (
            <div className="p-3 bg-red-900/50 text-red-400 text-sm rounded">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-900/50 text-green-400 text-sm rounded">Password updated successfully!</div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={updatingPassword}
            className="px-4 py-2 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] disabled:opacity-50"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-900 divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-zinc-500">No users found</div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-900/50 text-red-400 text-sm rounded">{createError}</div>
              )}
              {createSuccess && (
                <div className="p-3 bg-green-900/50 text-green-400 text-sm rounded">
                  User created successfully!
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="admin">Admin</option>
                  <option value="dev">Dev</option>
                  <option value="aux">Aux</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 p-3 bg-zinc-800 text-white rounded hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 p-3 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}