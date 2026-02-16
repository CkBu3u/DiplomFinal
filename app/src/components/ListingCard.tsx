import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { addToFavorites, removeFromFavorites, signOut } from '@/lib/supabase';
import { engineTypeToRu, transmissionToRu } from '@/lib/utils';
import type { Listing } from '@/lib/supabase';

interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onFavoriteChange?: (listingId: string, isFavorite: boolean) => void;
  view?: 'grid' | 'list';
}

export function ListingCard({ listing, isFavorite = false, onFavoriteChange, view = 'grid' }: ListingCardProps) {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mainImage = listing.images?.find(img => img.is_main)?.image_url || 
                   listing.images?.[0]?.image_url || 
                   '/images/car-placeholder.jpg';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (favorite) {
        const { error } = await removeFromFavorites(listing.id);
        if (error) {
          console.error('Ошибка удаления из избранного:', error);
        } else {
          setFavorite(false);
          onFavoriteChange?.(listing.id, false);
        }
      } else {
        const { error } = await addToFavorites(listing.id);
        if (error) {
          console.error('Ошибка добавления в избранное:', error);
          const msg = (error?.message || (error as Error)?.toString?.() || '');
          const isAuthError = /403|401|Forbidden|Permission|row-level security|session|сессия|JWT|refresh|Unauthorized/i.test(msg);
          if (isAuthError) {
            await signOut();
            alert('Сессия устарела. Вы вышли из аккаунта. Войдите снова и попробуйте добавить в избранное.');
            navigate('/auth');
          }
        } else {
          setFavorite(true);
          onFavoriteChange?.(listing.id, true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: listing.currency || 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'Новый';
    return `${(mileage / 1000).toFixed(0)} тыс. км`;
  };

  if (view === 'list') {
    return (
      <Link
        to={`/listing/${listing.id}`}
        className="listing-card flex gap-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
      >
        {/* Image */}
        <div className="relative w-48 lg:w-64 flex-shrink-0">
          <img
            src={imageError ? '/images/car-placeholder.jpg' : mainImage}
            alt={`${listing.brand?.name} ${listing.model?.name}`}
            className="card-image w-full h-full object-cover transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          {listing.is_premium && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0">
              Премиум
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`favorite-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white ${
              favorite ? 'text-red-500' : 'text-gray-400'
            }`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 py-4 pr-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
              {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
            </h3>
            <span className="card-price font-bold text-xl text-[#f97316] whitespace-nowrap ml-4">
              {formatPrice(listing.price)}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {listing.year} г.
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              {formatMileage(listing.mileage)}
            </span>
            {listing.engine_type && (
              <span className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                {engineTypeToRu(listing.engine_type)}
              </span>
            )}
            {listing.transmission && (
              <span className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                {transmissionToRu(listing.transmission)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {listing.city || 'Город не указан'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(listing.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="listing-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageError ? '/images/car-placeholder.jpg' : mainImage}
          alt={`${listing.brand?.name} ${listing.model?.name}`}
          className="card-image w-full h-full object-cover transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        {listing.is_premium && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0">
            Премиум
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`favorite-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white ${
            favorite ? 'text-red-500 active' : 'text-gray-400'
          }`}
          onClick={handleFavoriteClick}
          disabled={isLoading}
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
        </Button>
        
        {/* Views count */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-white text-xs">
          {listing.views_count} просмотров
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-[#2563eb] transition-colors">
          {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
        </h3>
        
        <p className="card-price font-bold text-xl text-[#f97316] mb-3">
          {formatPrice(listing.price)}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            {listing.year} г.
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-4 h-4 flex-shrink-0" />
            {formatMileage(listing.mileage)}
          </span>
          {listing.engine_type && (
            <span className="flex items-center gap-1">
              <Fuel className="w-4 h-4 flex-shrink-0" />
              {listing.engine_volume ? `${listing.engine_volume} л, ` : ''}{engineTypeToRu(listing.engine_type)}
            </span>
          )}
          {listing.transmission && (
            <span className="flex items-center gap-1">
              <Settings className="w-4 h-4 flex-shrink-0" />
              {transmissionToRu(listing.transmission)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{listing.city || 'Город не указан'}</span>
          </span>
          <span className="text-xs text-gray-400">
            {new Date(listing.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>
    </Link>
  );
}
