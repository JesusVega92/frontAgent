import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">frontAgent</h1>
        <p className="text-xl text-zinc-400 mb-8">AI-Powered Chat Platform</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}