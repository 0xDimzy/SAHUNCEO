import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchDetail, fetchEpisodes, Drama, Episode } from '../lib/api';
import { useStore } from '../store/useStore';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drama, setDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToList, removeFromList, isInList } = useStore();
  
  const isAdded = id ? isInList(id) : false;
  const episodeCountLabel =
    drama?.total_episode && drama.total_episode !== '0'
      ? `${drama.total_episode} Eps`
      : episodes.length > 0
        ? `${episodes.length} Eps`
        : 'Eps -';

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [dramaData, episodesData] = await Promise.all([
          fetchDetail(id),
          fetchEpisodes(id)
        ]);
        setDrama(dramaData);
        setEpisodes(episodesData);
      } catch (error) {
        console.error('Failed to load detail', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!drama) return null;

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
          <div className="absolute inset-0">
            <img
              src={drama.poster}
              alt={drama.title}
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum.photos')) {
                  target.src = 'https://picsum.photos/1920/1080?text=Detail+Image+Error';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{drama.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6 text-sm md:text-base text-gray-300">
              <span className="text-green-400 font-bold">98% Match</span>
              <span>{drama.release_date}</span>
              <span className="border border-gray-500 px-1 text-xs">HD</span>
              <span>{episodeCountLabel}</span>
              <span>{drama.genre}</span>
            </div>

            <div className="flex space-x-4 mb-8">
              <Link
                to={`/watch/${id}`}
                className="flex items-center px-8 py-3 bg-white text-black rounded font-bold hover:bg-gray-200 transition"
              >
                <Play className="w-5 h-5 mr-2 fill-black" />
                Play
              </Link>
              <button
                onClick={() => navigate('/')}
                className="flex items-center px-6 py-3 bg-gray-500/80 text-white rounded font-bold hover:bg-gray-500 transition"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
              </button>
              <button
                onClick={() => isAdded ? removeFromList(drama.bookId || drama.id) : addToList(drama)}
                className="flex items-center px-8 py-3 bg-gray-600/80 text-white rounded font-bold hover:bg-gray-600 transition"
              >
                {isAdded ? <Check className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                My List
              </button>
            </div>

            <p className="text-gray-300 text-lg line-clamp-3 max-w-2xl">{drama.description}</p>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="px-8 md:px-12 py-8">
          <h2 className="text-2xl font-bold mb-6">Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {episodes.map((ep, index) => (
              <Link
                key={`${ep.id}-${index}`}
                to={`/watch/${id}?ep=${ep.id}`}
                className="flex items-center p-4 bg-[#2f2f2f] rounded hover:bg-[#404040] transition group"
              >
                <div className="mr-4 text-gray-400 font-bold text-xl group-hover:text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm md:text-base">{ep.title}</h3>
                  <p className="text-xs text-gray-400">Durasi: {ep.duration || '-'}</p>
                </div>
                <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
