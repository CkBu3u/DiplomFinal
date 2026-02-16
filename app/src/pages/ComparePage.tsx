import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CompareCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  power: string;
  transmission: string;
  drive: string;
  color: string;
  image: string;
}

const mockCars: CompareCar[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 2500000,
    mileage: 45000,
    engine: '2.5 л, Бензин',
    power: '181 л.с.',
    transmission: 'Автомат',
    drive: 'Передний',
    color: 'Черный',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    brand: 'BMW',
    model: '3 Series',
    year: 2019,
    price: 2800000,
    mileage: 38000,
    engine: '2.0 л, Бензин',
    power: '184 л.с.',
    transmission: 'Автомат',
    drive: 'Задний',
    color: 'Белый',
    image: 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    brand: 'Mercedes',
    model: 'C-Class',
    year: 2021,
    price: 3200000,
    mileage: 25000,
    engine: '2.0 л, Бензин',
    power: '197 л.с.',
    transmission: 'Автомат',
    drive: 'Задний',
    color: 'Серебристый',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80',
  },
];

export function ComparePage() {
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState<CompareCar[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('compareList');
    if (saved) {
      setCompareList(JSON.parse(saved));
    } else {
      // Use mock data for demo
      setCompareList(mockCars.slice(0, 2));
    }
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareList.filter(car => car.id !== id);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const addMore = () => {
    navigate('/search');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Нет автомобилей для сравнения</h1>
          <p className="text-gray-500 mb-6">Добавьте автомобили из поиска для сравнения</p>
          <Button onClick={() => navigate('/search')}>Найти авто</Button>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Цена', key: 'price', format: (v: number) => formatPrice(v) },
    { label: 'Год', key: 'year' },
    { label: 'Пробег', key: 'mileage', format: (v: number) => `${v.toLocaleString('ru-RU')} км` },
    { label: 'Двигатель', key: 'engine' },
    { label: 'Мощность', key: 'power' },
    { label: 'Коробка', key: 'transmission' },
    { label: 'Привод', key: 'drive' },
    { label: 'Цвет', key: 'color' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Сравнение автомобилей</h1>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `150px repeat(${compareList.length + (compareList.length < 3 ? 1 : 0)}, 1fr)` }}>
              <div className="font-semibold text-gray-500">Характеристика</div>
              {compareList.map((car) => (
                <Card key={car.id} className="relative">
                  <button
                    onClick={() => removeFromCompare(car.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <CardContent className="p-4">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold">{car.brand} {car.model}</h3>
                    <p className="text-[#f97316] font-bold">{formatPrice(car.price)}</p>
                  </CardContent>
                </Card>
              ))}
              {compareList.length < 3 && (
                <Card className="border-dashed cursor-pointer hover:border-[#2563eb]" onClick={addMore}>
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Plus className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-gray-500">Добавить</span>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Specs Rows */}
            {specs.map((spec) => (
              <div
                key={spec.key}
                className="grid gap-4 py-3 border-b border-gray-100"
                style={{ gridTemplateColumns: `150px repeat(${compareList.length + (compareList.length < 3 ? 1 : 0)}, 1fr)` }}
              >
                <div className="font-medium text-gray-500">{spec.label}</div>
                {compareList.map((car) => {
                  const value = (car as any)[spec.key];
                  const isBest = spec.key === 'price' && value === Math.min(...compareList.map(c => c.price));
                  
                  return (
                    <div key={car.id} className={`${isBest ? 'text-green-600 font-medium' : ''}`}>
                      {spec.format ? spec.format(value) : value}
                      {isBest && <Check className="w-4 h-4 inline ml-1" />}
                    </div>
                  );
                })}
                {compareList.length < 3 && <div />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
