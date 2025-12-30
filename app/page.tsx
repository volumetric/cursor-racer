import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('./game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white text-xl">Loading Road Racer...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <PhaserGame />;
}
