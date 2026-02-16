import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/ListingCard';
import { getListings } from '@/lib/supabase';
import type { Listing } from '@/lib/supabase';

export function NewArrivals() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const { data } = await getListings({
          limit: 20,
          sortBy: 'created_at'
        });
        if (data) setListings(data);
        else setListings([]);
      } catch {
        setListings([]);
      }
      setIsLoading(false);
    };
    loadListings();
  }, []);

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, listings.length));
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#2563eb]" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Недавно добавленные</h2>
            </div>
          </div>
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#2563eb]" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Недавно добавленные</h2>
          </div>
          <Link
            to="/search?sort=created_at"
            className="flex items-center gap-1 text-[#2563eb] hover:text-[#f97316] transition-colors font-medium"
          >
            Смотреть все
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="listing-grid">
          {visibleListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShowMore}
              className="min-w-[200px]"
            >
              Показать еще
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
