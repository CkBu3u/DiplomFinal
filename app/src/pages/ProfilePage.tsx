import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Car, Heart, MessageSquare, Settings, 
  Edit, Trash2, Plus, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getCurrentUser, supabase } from '@/lib/supabase';
import type { User as UserType, Listing } from '@/lib/supabase';

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'listings';
  
  const [user, setUser] = useState<UserType | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      setUser(data);

      // Load user's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select(`
          *,
          brand:brands(name),
          model:models(name),
          images:listing_images(*)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      setListings(listingsData || []);

      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:listings(*, brand:brands(name), model:models(name), images:listing_images(*))
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      setFavorites(favoritesData || []);
      setIsLoading(false);
    };

    loadUser();
  }, [navigate]);

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingToDelete);

    if (!error) {
      setListings(prev => prev.filter(l => l.id !== listingToDelete));
    }
    
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  const confirmDelete = (id: string) => {
    setListingToDelete(id);
    setDeleteDialogOpen(true);
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
          <div className="skeleton h-32 rounded-2xl mb-6" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center text-white text-3xl font-bold">
              {user.first_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <Badge variant="secondary">{user.user_type === 'dealer' ? 'Дилер' : 'Частное лицо'}</Badge>
                {user.is_verified && <Badge className="bg-green-500">Верифицирован</Badge>}
                <Badge variant="outline">{user.city || 'Город не указан'}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/profile?tab=settings')}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
              <div className="text-sm text-gray-500">Объявлений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{favorites.length}</div>
              <div className="text-sm text-gray-500">В избранном</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {listings.reduce((sum, l) => sum + (l.views_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Просмотров</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={defaultTab} onValueChange={(tab) => setSearchParams({ tab })}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="listings">
              <Car className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Объявления</span>
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Избранное</span>
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Сообщения</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Мои объявления</h2>
              <Button onClick={() => navigate('/create-listing')}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map((listing) => {
                  const mainImage = listing.images?.find(img => img.is_main)?.image_url || 
                                   listing.images?.[0]?.image_url || 
                                   '/images/car-placeholder.jpg';

                  return (
                    <div key={listing.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                      <img
                        src={mainImage}
                        alt={listing.title}
                        className="w-32 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {listing.title || `${listing.brand?.name} ${listing.model?.name}, ${listing.year}`}
                            </h3>
                            <p className="text-[#f97316] font-bold">{formatPrice(listing.price)}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {listing.views_count}
                              </span>
                              <span>{new Date(listing.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/listing/${listing.id}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/create-listing?edit=${listing.id}`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete(listing.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status === 'active' ? 'Активно' : listing.status}
                          </Badge>
                          {listing.is_premium && <Badge className="bg-amber-500">Премиум</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">У вас нет объявлений</h3>
                <p className="text-gray-500 mb-4">Разместите свое первое объявление</p>
                <Button onClick={() => navigate('/create-listing')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Разместить объявление
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <h2 className="text-xl font-bold mb-4">Избранное</h2>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={fav.listing?.images?.[0]?.image_url || '/images/car-placeholder.jpg'}
                      alt={fav.listing?.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">
                        {fav.listing?.title || `${fav.listing?.brand?.name} ${fav.listing?.model?.name}`}
                      </h3>
                      <p className="text-[#f97316] font-bold">{formatPrice(fav.listing?.price || 0)}</p>
                      <Button 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => navigate(`/listing/${fav.listing?.id}`)}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Избранное пусто</h3>
                <p className="text-gray-500 mb-4">Сохраняйте понравившиеся объявления</p>
                <Button onClick={() => navigate('/search')}>Найти авто</Button>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="text-center py-12 bg-white rounded-2xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Сообщения</h3>
              <p className="text-gray-500">Здесь будут отображаться ваши переписки с продавцами</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Настройки профиля</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Телефон</Label>
                  <p className="font-medium">{user.phone || 'Не указан'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Город</Label>
                  <p className="font-medium">{user.city || 'Не указан'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Регион</Label>
                  <p className="font-medium">{user.region || 'Не указан'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить объявление?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Объявление будет удалено навсегда.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteListing}>
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Missing import
import { Label } from '@/components/ui/label';
