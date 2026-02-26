import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SkipBack, SkipForward, List } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { fetchEpisodes, fetchVideoUrl, Episode } from '../lib/api';
import { useStore } from '../store/useStore';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const episodeId = searchParams.get('ep');
  const { platform } = useStore();
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const { updateProgress } = useStore();

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!id) return;
      try {
        const data = await fetchEpisodes(id);
        setEpisodes(data);
        
        if (data.length > 0) {
          const ep = episodeId 
            ? data.find((e: Episode) => e.id === episodeId) 
            : data[0];
          const selectedEp = ep || data[0];
          setCurrentEpisode(selectedEp);
          
          if (platform === 'melolo' || platform === 'netshort' || platform === 'reelife') {
            setVideoLoading(true);
            try {
              const url = await fetchVideoUrl(selectedEp.id, id);
              // Fallback to episode URL from list response if watch endpoint returns empty
              setVideoUrl(url || selectedEp.url || '');
            } catch (error) {
              console.error('Failed to fetch direct video URL, using episode fallback URL', error);
              setVideoUrl(selectedEp.url || '');
            } finally {
              setVideoLoading(false);
            }
          } else {
            setVideoUrl(selectedEp.url);
          }
        }
      } catch (error) {
        console.error('Failed to load episodes', error);
      } finally {
        setLoading(false);
      }
    };
    loadEpisodes();
  }, [id, episodeId, platform]);

  const handleNextEpisode = () => {
    if (!currentEpisode || !episodes.length) return;
    const currentIndex = episodes.findIndex((e) => e.id === currentEpisode.id);
    if (currentIndex < episodes.length - 1) {
      const nextEp = episodes[currentIndex + 1];
      navigate(`/watch/${id}?ep=${nextEp.id}`);
    }
  };

  const handlePreviousEpisode = () => {
    if (!currentEpisode || !episodes.length) return;
    const currentIndex = episodes.findIndex((e) => e.id === currentEpisode.id);
    if (currentIndex > 0) {
      const prevEp = episodes[currentIndex - 1];
      navigate(`/watch/${id}?ep=${prevEp.id}`);
    }
  };

  const handleProgress = (state: { playedSeconds: number; played: number }) => {
    if (id && currentEpisode) {
      // Save progress every 5 seconds or so (debounced in real app, but here simple)
      // updateProgress(id, currentEpisode.id, state.playedSeconds);
    }
  };

  if (loading) return <div className="bg-black h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!currentEpisode) return <div className="bg-black h-screen flex items-center justify-center text-white">Episode not found</div>;

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden group">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/detail/${id}`)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/60 rounded-full text-white hover:bg-white/20 transition"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-sm font-semibold">Kembali</span>
      </button>

      {/* Video Player */}
      {videoLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p>Fetching video link...</p>
        </div>
      ) : videoUrl ? (
        <VideoPlayer
          url={videoUrl}
          onEnded={handleNextEpisode}
          onProgress={handleProgress}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
          <p className="text-xl font-bold">Video URL not found</p>
          <p className="text-gray-400">This episode might not be available yet.</p>
          <button
            onClick={() => navigate(`/detail/${id}`)}
            className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Controls Overlay (Custom if needed, but ReactPlayer has controls) */}
      
      {/* Episode List Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
      >
        <List className="w-6 h-6" />
      </button>

      {/* Episode Sidebar */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md transform transition-transform duration-300 z-40 overflow-y-auto ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>
          <div className="space-y-2">
            {episodes.map((ep, index) => (
              <button
                key={`${ep.id}-${index}`}
                onClick={() => {
                  navigate(`/watch/${id}?ep=${ep.id}`);
                  setShowSidebar(false);
                }}
                className={`w-full text-left p-3 rounded flex items-center space-x-3 transition ${
                  currentEpisode.id === ep.id
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <span className="text-lg font-bold w-6">{index + 1}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">{ep.title}</h4>
                  <span className="text-xs opacity-70">Durasi: {ep.duration || '-'}</span>
                </div>
                {currentEpisode.id === ep.id && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Next Episode Button (if available) */}
      {episodes.findIndex(e => e.id === currentEpisode.id) > 0 && (
        <button
          onClick={handlePreviousEpisode}
          className="absolute bottom-20 left-8 z-50 px-6 py-3 bg-white text-black font-bold rounded flex items-center space-x-2 hover:bg-gray-200 transition opacity-0 group-hover:opacity-100"
        >
          <SkipBack className="w-5 h-5" />
          <span>Previous Episode</span>
        </button>
      )}

      {/* Next Episode Button (if available) */}
      {episodes.findIndex(e => e.id === currentEpisode.id) < episodes.length - 1 && (
        <button
          onClick={handleNextEpisode}
          className="absolute bottom-20 right-8 z-50 px-6 py-3 bg-white text-black font-bold rounded flex items-center space-x-2 hover:bg-gray-200 transition opacity-0 group-hover:opacity-100"
        >
          <span>Next Episode</span>
          <SkipForward className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
