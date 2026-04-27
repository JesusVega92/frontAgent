'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InvitationData {
  email: string;
  role: string;
}

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkInvitation() {
      const { token } = await params;
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Invalid invitation');
        } else {
          setInvitation(data);
        }
      } catch {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    checkInvitation();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      const { token } = await params;
      const res = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      router.push('/login?created=true');
    } catch {
      setError('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#ef4444] mb-2">Invalid Invitation</h1>
          <p className="text-[#a1a1aa]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Set Your Password</h1>
        <p className="text-center text-[#a1a1aa] mb-8">
          You have been invited as a{' '}
          <span className="text-[#a855f7] font-medium">{invitation?.role}</span>
        </p>
        <p className="text-center text-[#a1a1aa] mb-6">
          Invitation sent to: <span className="text-white">{invitation?.email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#7f1d1d] text-[#fca5a5] text-sm rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#262626] rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#262626] rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#262626] rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full p-3 bg-[#3b82f6] text-white font-medium rounded hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}