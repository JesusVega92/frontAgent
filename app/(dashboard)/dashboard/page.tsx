'use client';

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  const stats = [
    { label: 'Total Users', value: '124', change: '+12%' },
    { label: 'Active Sessions', value: '18', change: '+5%' },
    { label: 'Messages Today', value: '342', change: '+28%' },
    { label: 'API Calls', value: '1,256', change: '+15%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
      <div className="mb-6">
        <p className="text-zinc-400">Welcome back, {session?.user?.name || 'User'}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="text-sm text-zinc-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-green-400 mt-2">{stat.change} from last month</div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">New user registration</span>
            <span className="text-sm text-zinc-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Chat session started</span>
            <span className="text-sm text-zinc-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-400">API endpoint updated</span>
            <span className="text-sm text-zinc-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}