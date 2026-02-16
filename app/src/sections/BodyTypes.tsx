import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Truck, Van, CircleDot } from 'lucide-react';

interface BodyType {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
}

const bodyTypes: BodyType[] = [
  { id: 'sedan', name: 'Седан', icon: Car, count: 45000 },
  { id: 'suv', name: 'Внедорожник', icon: Truck, count: 32000 },
  { id: 'hatchback', name: 'Хэтчбек', icon: Car, count: 18000 },
  { id: 'wagon', name: 'Универсал', icon: Car, count: 8000 },
  { id: 'coupe', name: 'Купе', icon: Car, count: 5000 },
  { id: 'minivan', name: 'Минивэн', icon: Van, count: 6000 },
  { id: 'pickup', name: 'Пикап', icon: Truck, count: 4000 },
  { id: 'convertible', name: 'Кабриолет', icon: CircleDot, count: 1500 },
];

export function BodyTypes() {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Выберите тип кузова
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Найдите автомобиль по типу кузова, который подходит именно вам
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {bodyTypes.map((type) => {
            const Icon = type.icon;
            const isHovered = hoveredType === type.id;

            return (
              <Link
                key={type.id}
                to={`/search?body_type=${type.id}`}
                className="group"
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
              >
                <div
                  className={`body-type-option h-full ${
                    isHovered ? 'selected' : ''
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-[#2563eb]/10'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span
                    className={`font-medium text-sm transition-colors ${
                      isHovered ? 'text-[#2563eb]' : 'text-gray-700'
                    }`}
                  >
                    {type.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {type.count.toLocaleString('ru-RU')} объявлений
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
