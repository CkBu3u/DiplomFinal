import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getFavorites, removeFromFavorites } from '@/lib/supabase';
import type { Favorite } from '@/lib/supabase';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data } = await getFavorites();
      if (data) {
        setFavorites(data);
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [navigate]);

  const handleRemove = async (listingId: string) => {
    await removeFromFavorites(listingId);
    setFavorites(prev => prev.filter(f => f.listing_id !== listingId));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Избранное</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Избранное</h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => {
              const listing = favorite.listing;
              if (!listing) return null;

              const mainImage = listing.images?.find(img => img.is_main)?.image_url || 
                               listing.images?.[0]?.image_url || 
                               '/images/car-placeholder.jpg';

              return (
                <div key={favorite.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={mainImage}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
                    </h3>
                    <p className="text-[#f97316] font-bold text-lg mb-2">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span>{listing.year} г.</span>
                      <span>•</span>
                      <span>{listing.mileage ? `${(listing.mileage / 1000).toFixed(0)} тыс. км` : 'Новый'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Избранное пусто</h3>
            <p className="text-gray-500 mb-6">Сохраняйте понравившиеся объявления, чтобы не потерять их</p>
            <Button onClick={() => navigate('/search')} className="bg-[#f97316] hover:bg-[#ea580c]">
              Найти авто
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
