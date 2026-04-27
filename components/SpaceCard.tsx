'use client';

import { useState } from 'react';

interface Space {
  _id: string;
  title: string;
  description: string;
  isOccupied: boolean;
  occupiedBy: string | null;
  occupiedByName: string | null;
}

interface SpaceCardProps {
  space: Space;
  user: {
    id: string;
    name: string | null;
    role: string;
  } | null;
  onToggle: (spaceId: string) => Promise<void>;
}

export default function SpaceCard({ space, user, onToggle }: SpaceCardProps) {
  const [loading, setLoading] = useState(false);

  const canToggle = user && (user.role === 'admin' || user.role === 'dev');
  const isOwner = space.occupiedBy === user?.id;
  const canRelease = user?.role === 'admin' || isOwner;
const isClickable = canToggle && (!space.isOccupied || canRelease);

  const handleClick = async () => {
    if (!isClickable || loading) return;
    setLoading(true);
    try {
      await onToggle(space._id);
    } finally {
      setLoading(false);
    }
  };

if (space.isOccupied) {
    return (
      <div
        className={`bg-tertiary-container rounded-xl border border-tertiary-container shadow-2xl p-4 flex flex-col justify-between h-64 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
          isClickable ? 'hover:brightness-110' : 'opacity-90'
        }`}
        onClick={handleClick}
      >
        <div className="flex justify-end items-start">
          <span className="bg-on-tertiary-container text-tertiary px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Occupied
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{space.title}</h3>
          <p className="text-sm font-medium text-on-tertiary-container uppercase mt-4">
            Reserved by
          </p>
          <h3 className="text-xl font-bold text-white">
            {space.occupiedByName || 'Unknown'}
          </h3>
          {isOwner && (
            <p className="text-sm text-orange-200 mt-1">Click to release</p>
          )}
          {user?.role === 'admin' && !isOwner && (
            <p className="text-sm text-orange-200 mt-1">Admin: click to release</p>
          )}
        </div>
        <div />
      </div>
    );
  }

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col justify-between h-64 cursor-pointer group hover:border-secondary transition-all hover:shadow-2xl hover:-translate-y-1 ${
        isClickable ? 'hover:border-secondary' : 'opacity-60'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-end items-start">
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Available
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">{space.title}</h3>
        <p className="text-sm text-gray-400 mt-2">{space.description}</p>
      </div>
      <div />
    </div>
  );
}