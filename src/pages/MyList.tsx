import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { useStore } from '../store/useStore';

export default function MyList() {
  const { myList } = useStore();

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 flex-grow">
        <h1 className="text-2xl font-bold text-white mb-6">My List</h1>
        
        {myList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
            {myList.map((drama, index) => (
              <MovieCard key={`${drama.bookId || drama.id}-${index}`} drama={drama} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <p className="text-xl mb-4">Your list is empty.</p>
            <p>Add dramas to your list to see them here.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
