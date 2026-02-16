import { useState } from 'react';
import { Search, MapPin, Phone, Star, Car, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const dealers = [
  {
    id: 1,
    name: 'АвтоГалактика',
    logo: 'AG',
    location: 'Москва',
    rating: 4.8,
    reviews: 245,
    cars: 156,
    phone: '+7 (495) 123-45-67',
    verified: true,
    specialties: ['Toyota', 'Lexus', 'BMW'],
  },
  {
    id: 2,
    name: 'МоторПлаза',
    logo: 'MP',
    location: 'Санкт-Петербург',
    rating: 4.6,
    reviews: 189,
    cars: 98,
    phone: '+7 (812) 987-65-43',
    verified: true,
    specialties: ['Mercedes', 'Audi', 'Volkswagen'],
  },
  {
    id: 3,
    name: 'АвтоПремиум',
    logo: 'AP',
    location: 'Москва',
    rating: 4.9,
    reviews: 312,
    cars: 203,
    phone: '+7 (495) 555-44-33',
    verified: true,
    specialties: ['Porsche', 'BMW', 'Mercedes'],
  },
  {
    id: 4,
    name: 'Центральный Автосалон',
    logo: 'ЦА',
    location: 'Казань',
    rating: 4.5,
    reviews: 128,
    cars: 87,
    phone: '+7 (843) 111-22-33',
    verified: false,
    specialties: ['Kia', 'Hyundai', 'Renault'],
  },
  {
    id: 5,
    name: 'Европа Авто',
    logo: 'ЕА',
    location: 'Новосибирск',
    rating: 4.7,
    reviews: 167,
    cars: 112,
    phone: '+7 (383) 444-55-66',
    verified: true,
    specialties: ['Volvo', 'Skoda', 'Volkswagen'],
  },
  {
    id: 6,
    name: 'АзиатМоторс',
    logo: 'АМ',
    location: 'Владивосток',
    rating: 4.4,
    reviews: 89,
    cars: 67,
    phone: '+7 (423) 777-88-99',
    verified: false,
    specialties: ['Toyota', 'Honda', 'Nissan'],
  },
];

export function DealersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDealers, setFilteredDealers] = useState(dealers);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = dealers.filter(dealer =>
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDealers(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Автосалоны и дилеры
          </h1>
          <p className="text-gray-500 text-lg">
            Найдите проверенного дилера в вашем городе. 
            Все автосалоны проходят верификацию.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по названию, городу или марке"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-[#f97316] hover:bg-[#ea580c]">
              Найти
            </Button>
          </div>
        </form>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center text-white font-bold text-xl">
                    {dealer.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{dealer.name}</h3>
                      {dealer.verified && (
                        <Verified className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {dealer.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-medium">{dealer.rating}</span>
                    <span className="text-gray-400 text-sm">({dealer.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Car className="w-4 h-4" />
                    <span>{dealer.cars} авто</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {dealer.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{dealer.phone}</span>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  Посмотреть авто
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDealers.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Дилеры не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}
