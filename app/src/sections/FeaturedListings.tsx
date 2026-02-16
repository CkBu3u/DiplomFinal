import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getListings } from '@/lib/supabase';
import type { Listing } from '@/lib/supabase';

export function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const { data } = await getListings({
          limit: 10,
          sortBy: 'created_at'
        });
        if (data) {
          const premiumListings = data.filter(l => l.is_premium);
          setListings(premiumListings.length > 0 ? premiumListings : data.slice(0, 8));
        } else {
          setListings([]);
        }
      } catch {
        setListings([]);
      }
      setIsLoading(false);
    };
    loadListings();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Премиум объявления</h2>
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton w-72 h-80 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Премиум объявления</h2>
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {listings.map((listing) => {
            const mainImage = listing.images?.find(img => img.is_main)?.image_url || 
                             listing.images?.[0]?.image_url || 
                             '/images/car-placeholder.jpg';

            return (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group flex-shrink-0 w-72 snap-start"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={mainImage}
                      alt={`${listing.brand?.name} ${listing.model?.name}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Премиум
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#2563eb] transition-colors">
                      {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
                    </h3>
                    <p className="font-bold text-xl text-[#f97316] mb-2">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{listing.year} г.</span>
                      <span>{listing.mileage ? `${(listing.mileage / 1000).toFixed(0)} тыс. км` : 'Новый'}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {listing.city}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
