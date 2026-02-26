import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { fetchVIP, Drama } from '../lib/api';

export default function VIP() {
  const [movies, setMovies] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchVIP();
        setMovies(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 flex-grow">
        <h1 className="text-2xl font-bold text-white mb-6">VIP Exclusive</h1>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
            {movies.map((drama, index) => (
              <MovieCard key={`${drama.bookId || drama.id}-${index}`} drama={drama} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
