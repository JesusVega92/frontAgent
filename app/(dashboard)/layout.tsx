'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/spaces', label: 'Spaces', icon: '📍' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = session?.user?.role as string;
  const isAdmin = userRole === 'admin';
  const canAccessSpaces = userRole === 'admin' || userRole === 'dev';
  
  const visibleNavItems = navItems.filter((item) => {
    if (item.href === '/users') return isAdmin;
    if (item.href === '/spaces') return canAccessSpaces;
    return true;
  });

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-zinc-900 text-white flex flex-col border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold">frontAgent</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {visibleNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded ${
                    pathname === item.href
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="text-sm text-zinc-400 mb-2">
            {session?.user?.name || session?.user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-zinc-950">{children}</main>
    </div>
  );
}