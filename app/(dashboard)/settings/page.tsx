'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
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
    </div>
  );
}