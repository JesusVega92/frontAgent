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

interface Invitation {
  _id: string;
  email: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    fetchUsers();
    if (isAdmin) {
      fetchInvitations();
    }
  }, [isAdmin]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvitations() {
    try {
      const res = await fetch('/api/invitations');
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch {
      // error
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    setInviteSuccess(false);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error);
        return;
      }

      setInviteSuccess(true);
      setInviteEmail('');
      setInviteRole('user');
      fetchInvitations();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess(false);
      }, 2000);
    } catch {
      setInviteError('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb]"
          >
            Invite User
          </button>
        )}
      </div>

      {isAdmin && invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Pending Invitations</h2>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Expires</th>
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                {invitations.map((inv) => (
                  <tr key={inv._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{inv.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${inv.role === 'admin' ? 'bg-purple-900/50 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inv.usedAt ? (
                        <span className="text-green-400 text-sm">Used</span>
                      ) : (
                        <span className="text-yellow-400 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">Invite New User</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-900/50 text-red-400 text-sm rounded">{inviteError}</div>
              )}
              {inviteSuccess && (
                <div className="p-3 bg-green-900/50 text-green-400 text-sm rounded">
                  Invitation sent successfully!
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 p-3 bg-zinc-800 text-white rounded hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 p-3 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}