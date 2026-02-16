import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, Share2, Flag, Phone, MessageCircle, MapPin, 
  Calendar, Gauge, Fuel, Settings, Users, Palette, 
  ChevronLeft, Check, AlertTriangle, Car, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getListingById, addToFavorites, removeFromFavorites, incrementListingViews, getCurrentUser, getReviewsForListing, createReview, supabase, signOut } from '@/lib/supabase';
import { engineTypeToRu, transmissionToRu, driveTypeToRu, bodyTypeToRu } from '@/lib/utils';
import type { Listing } from '@/lib/supabase';

interface ReviewRow {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (!listing?.id) return;
    getReviewsForListing(listing.id).then(({ data }) => setReviews(data));
  }, [listing?.id]);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      setIsLoading(true);
      
      const { data } = await getListingById(id);
      if (data) {
        setListing(data);
        // Increment views
        await incrementListingViews(id);
        
        // Check if favorite
        const { data: favData } = await supabase
          .from('favorites')
          .select('*')
          .eq('listing_id', id)
          .single();
        setIsFavorite(!!favData);
      }
      setIsLoading(false);
    };
    
    loadListing();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!id) return;

    if (isFavorite) {
      await removeFromFavorites(id);
      setIsFavorite(false);
    } else {
      const { error } = await addToFavorites(id);
      if (error) {
        console.error('Ошибка добавления в избранное:', error);
        const msg = error?.message || (error as Error)?.toString?.() || '';
        const isAuthError = /403|401|Forbidden|Permission denied|row-level security|session|сессия|JWT|refresh|Unauthorized/i.test(msg);
        if (isAuthError) {
          await signOut();
          alert('Сессия устарела или недействительна. Вы вышли из аккаунта. Войдите снова и попробуйте добавить в избранное.');
          navigate('/auth');
          return;
        }
        alert(`Избранное: ${msg || 'Не удалось добавить'}\n\nПодробности в консоли (F12 → Console).`);
        return;
      }
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing?.brand?.name} ${listing?.model?.name}`,
          text: listing?.title || `${listing?.brand?.name} ${listing?.model?.name}, ${listing?.year}`,
          url: window.location.href,
        });
      } catch (err) {
        setShowShareDialog(true);
      }
    } else {
      setShowShareDialog(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareDialog(false);
  };

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'Новый';
    return `${mileage.toLocaleString('ru-RU')} км`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="skeleton h-96 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-8 rounded-xl w-1/2" />
              <div className="skeleton h-32 rounded-xl" />
            </div>
            <div className="skeleton h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Объявление не найдено</h1>
          <p className="text-gray-500 mb-6">Возможно, оно было удалено или перемещено</p>
          <Button onClick={() => navigate('/search')}>К поиску</Button>
        </div>
      </div>
    );
  }

  const images: { image_url: string; is_main: boolean }[] =
    listing.images && listing.images.length > 0
      ? listing.images
      : [{ image_url: '/images/car-placeholder.jpg', is_main: true }];
  const mainImage = images[currentImageIndex]?.image_url ?? images[0]?.image_url ?? '';

  const specifications = [
    { label: 'Год выпуска', value: listing.year, icon: Calendar },
    { label: 'Пробег', value: formatMileage(listing.mileage), icon: Gauge },
    { label: 'Кузов', value: bodyTypeToRu(listing.body_type) || listing.body_type, icon: Car },
    { label: 'Цвет', value: listing.color, icon: Palette },
    { label: 'Двигатель', value: `${listing.engine_volume ? listing.engine_volume + ' л, ' : ''}${engineTypeToRu(listing.engine_type)}`, icon: Fuel },
    { label: 'Мощность', value: listing.engine_power ? `${listing.engine_power} л.с.` : '-', icon: Zap },
    { label: 'Коробка', value: transmissionToRu(listing.transmission), icon: Settings },
    { label: 'Привод', value: driveTypeToRu(listing.drive_type) || listing.drive_type, icon: Users },
    { label: 'Владельцев', value: listing.owners_count ? `${listing.owners_count} ${listing.owners_count === 1 ? 'владелец' : 'владельца'}` : '-', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-[#2563eb]">Главная</button>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <button onClick={() => navigate('/search')} className="hover:text-[#2563eb]">Поиск</button>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-gray-900">{listing.brand?.name} {listing.model?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] bg-gray-100">
                <img
                  src={mainImage}
                  alt={`${listing.brand?.name} ${listing.model?.name}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 rotate-180" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.is_premium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white">
                      Премиум
                    </Badge>
                  )}
                  {listing.condition === 'new' && (
                    <Badge className="bg-green-500 text-white">Новый</Badge>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="gallery-thumbnails p-4">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`gallery-thumbnail ${currentImageIndex === idx ? 'active' : ''}`}
                    >
                      <img src={img.image_url} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
              </h1>
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.city || 'Город не указан'}
                </span>
                <span>•</span>
                <span>{new Date(listing.created_at).toLocaleDateString('ru-RU')}</span>
                <span>•</span>
                <span>{listing.views_count} просмотров</span>
              </div>
              <div className="text-3xl font-bold text-[#f97316]">
                {formatPrice(listing.price, listing.currency)}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Характеристики</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specifications.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div key={spec.label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{spec.label}</div>
                        <div className="font-medium text-gray-900">{spec.value || '-'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Описание</h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Комплектация</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Кондиционер', 'Подогрев сидений', 'Круиз-контроль', 'Парктроники', 
                  'Камера заднего вида', 'Bluetooth', 'Легкосплавные диски', 'ABS'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Отзывы о продавце</h2>
              {reviews.length > 0 ? (
                <ul className="space-y-4 mb-6">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                      {r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm mb-6">Пока нет отзывов.</p>
              )}
              {currentUser && listing?.user_id && currentUser.id !== listing.user_id && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!listing?.id || !reviewComment.trim()) return;
                    setReviewSubmitting(true);
                    await createReview(listing.user_id, listing.id, reviewRating, reviewComment.trim());
                    const { data } = await getReviewsForListing(listing.id);
                    setReviews(data ?? []);
                    setReviewComment('');
                    setReviewRating(5);
                    setReviewSubmitting(false);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700">Оценка</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl text-amber-400 hover:text-amber-500 focus:outline-none"
                        >
                          {star <= reviewRating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Комментарий</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Напишите отзыв..."
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={reviewSubmitting} className="bg-[#f97316] hover:bg-[#ea580c]">
                    {reviewSubmitting ? 'Отправка...' : 'Оставить отзыв'}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-3xl font-bold text-[#f97316] mb-4">
                {formatPrice(listing.price, listing.currency)}
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-14 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold"
                  onClick={() => setShowPhone((v) => !v)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {showPhone ? (listing.contact_phone || 'Телефон скрыт') : 'Показать телефон'}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => navigate('/messages', { state: { sellerId: listing.user_id, listingId: listing.id, listingTitle: listing.title } })}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Написать продавцу
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 ${isFavorite ? 'text-red-500' : ''}`}
                    onClick={handleFavoriteToggle}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                <Button variant="ghost" className="w-full text-gray-500">
                  <Flag className="w-4 h-4 mr-2" />
                  Пожаловаться
                </Button>
              </div>

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Продавец</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center">
                    <span className="text-white font-bold">
                      {listing.contact_name?.[0] || listing.user?.first_name?.[0] || 'П'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {listing.contact_name || listing.user?.first_name || 'Частное лицо'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {listing.user?.user_type === 'dealer' ? 'Автосалон' : 'Частное лицо'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Поделиться объявлением</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-transparent text-sm"
              />
              <Button onClick={copyToClipboard} size="sm">
                Копировать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
