import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Drama } from '../lib/api';
import { useStore } from '../store/useStore';

interface MovieCardProps {
  drama: Drama;
}

export default function MovieCard({ drama }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { myList, addToList, removeFromList, isInList } = useStore();
  const dramaId = drama.bookId || drama.id;
  const isAdded = isInList(dramaId);
  const rawDrama = drama as any;
  const resolvedEpisode =
    drama.total_episode ||
    rawDrama.totalEpisode ||
    rawDrama.episodeCount ||
    rawDrama.episodesCount ||
    rawDrama.shortPlayEpisodeCount ||
    rawDrama.videoCount ||
    '';
  const resolvedDuration =
    drama.duration ||
    rawDrama.videoDuration ||
    rawDrama.timeLength ||
    rawDrama.playTime ||
    rawDrama.durationText ||
    '';

  const episodeLabel = String(resolvedEpisode).trim() && String(resolvedEpisode) !== '0' ? `${resolvedEpisode} Eps` : 'Eps -';
  const durationLabel = String(resolvedDuration).trim() && String(resolvedDuration) !== '0' ? String(resolvedDuration) : '-';

  const handleListToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeFromList(dramaId);
    } else {
      addToList(drama);
    }
  };

  const handleCardClick = () => {
    navigate(`/detail/${dramaId}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${dramaId}`);
  };

  return (
    <motion.div
      className="relative w-full cursor-pointer transition duration-200 ease-out md:hover:scale-105 group"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-lg">
        <img
          src={drama.poster}
          alt={drama.title}
          className="object-cover w-full h-full absolute inset-0 transition-transform duration-300 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('picsum.photos')) {
              target.src = 'https://picsum.photos/400/600?text=Image+Error';
            }
          }}
        />

        {/* Overlay buttons on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3">
          <button
            onClick={handlePlayClick}
            className="bg-red-600 rounded-full p-3 hover:bg-red-700 transition transform hover:scale-110"
          >
            <Play className="h-5 w-5 text-white fill-white" />
          </button>
          <button
            onClick={handleListToggle}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 hover:bg-white/40 transition transform hover:scale-110"
          >
            {isAdded ? <Check className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
          </button>
        </div>

        <div className="absolute top-2 right-2">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
            New
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1 group-hover:text-red-500 transition-colors">
          {drama.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1">Episode: {episodeLabel}</p>
        <p className="text-gray-400 text-xs mt-1">Durasi: {durationLabel}</p>
      </div>
    </motion.div>
  );
}
