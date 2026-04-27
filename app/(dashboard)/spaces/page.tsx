'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SpaceCard from '@/components/SpaceCard';

interface Space {
  _id: string;
  title: string;
  description: string;
  isOccupied: boolean;
  occupiedBy: string | null;
  occupiedByName: string | null;
}

export default function SpacesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSpace, setNewSpace] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const userRole = session?.user?.role as string;
  const canManage = userRole === 'admin' || userRole === 'dev';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (userRole !== 'admin' && userRole !== 'dev') {
        router.push('/dashboard');
      } else {
        fetchSpaces();
      }
    }
  }, [status, userRole, router]);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        const data = await res.json();
        setSpaces(data);
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (spaceId: string) => {
    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        await fetchSpaces();
      }
    } catch (error) {
      console.error('Failed to toggle space:', error);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpace.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpace),
      });
      if (res.ok) {
        setNewSpace({ title: '', description: '' });
        setShowForm(false);
        await fetchSpaces();
      }
    } catch (error) {
      console.error('Failed to create space:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this space?')) return;

    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchSpaces();
      }
    } catch (error) {
      console.error('Failed to delete space:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const availableCount = spaces.filter((s) => !s.isOccupied).length;
  const occupiedCount = spaces.filter((s) => s.isOccupied).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-white">Space Availability</h1>
        <p className="text-zinc-400">
          Manage and monitor real-time resource allocation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-900/50 flex items-center justify-center">
            <span className="text-green-400 text-xl">✓</span>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase">Available</p>
            <p className="text-2xl font-bold text-white">{availableCount}</p>
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-900/50 flex items-center justify-center">
            <span className="text-orange-400 text-xl">🔒</span>
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase">Occupied</p>
            <p className="text-2xl font-bold text-white">{occupiedCount}</p>
          </div>
        </div>
        <div className="md:col-span-2 bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
          <div>
            <p className="text-sm text-zinc-500 uppercase">Total Spaces</p>
            <p className="text-2xl font-bold text-white">{spaces.length}</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white text-sm transition-colors"
            >
              {showForm ? 'Cancel' : '+ Add Space'}
            </button>
          )}
        </div>
      </div>

      {showForm && canManage && (
        <div className="mb-6 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 text-white">Create New Space</h3>
          <form onSubmit={handleCreateSpace} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={newSpace.title}
                onChange={(e) =>
                  setNewSpace({ ...newSpace, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="e.g., Room 401, Desk 08"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newSpace.description}
                onChange={(e) =>
                  setNewSpace({ ...newSpace, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="e.g., Conference Suite A"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 rounded-lg text-white text-sm transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Space'}
            </button>
          </form>
        </div>
      )}

      {spaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">No spaces found</p>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Create your first space
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spaces.map((space) => (
            <div key={space._id} className="relative">
              <SpaceCard
                space={space}
                user={session?.user as { id: string; name: string | null; role: string } | null}
                onToggle={handleToggle}
              />
              {canManage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(space._id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-900/80 hover:bg-red-700 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete space"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}