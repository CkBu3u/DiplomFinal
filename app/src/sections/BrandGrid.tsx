import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getPopularBrands } from '@/lib/supabase';
import type { Brand } from '@/lib/supabase';

export function BrandGrid() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      setIsLoading(true);
      try {
        const { data } = await getPopularBrands();
        if (data) setBrands(data.slice(0, 12));
        else setBrands([]);
      } catch {
        setBrands([]);
      }
      setIsLoading(false);
    };
    loadBrands();
  }, []);

  // Brand logos mapping (using SVG icons for popular brands)
  const brandLogos: Record<string, string> = {
    'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/120px-Toyota_carlogo.svg.png',
    'Honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/120px-Honda.svg.png',
    'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/120px-BMW.svg.png',
    'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/120px-Mercedes-Logo.svg.png',
    'Audi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi_logo.svg/120px-Audi_logo.svg.png',
    'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/120px-Volkswagen_logo_2019.svg.png',
    'Ford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/120px-Ford_logo_flat.svg.png',
    'Chevrolet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Chevrolet_logo.png/120px-Chevrolet_logo.png',
    'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hyundai_Motor_Company_logo.svg/120px-Hyundai_Motor_Company_logo.svg.png',
    'Kia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_Motors.svg/120px-Kia_Motors.svg.png',
    'Nissan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/120px-Nissan_logo.png',
    'Mazda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mazda_logo.svg/120px-Mazda_logo.svg.png',
    'Lexus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lexus_logo.svg/120px-Lexus_logo.svg.png',
    'Volvo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Volvo_logo.svg/120px-Volvo_logo.svg.png',
    'Skoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/%C5%A0koda_logo_2016.svg/120px-%C5%A0koda_logo_2016.svg.png',
    'Renault': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Renault_Logo_2021.svg/120px-Renault_Logo_2021.svg.png',
    'Peugeot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Peugeot_logo_2021.svg/120px-Peugeot_logo_2021.svg.png',
    'Citroen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Citroen_2016_logo.svg/120px-Citroen_2016_logo.svg.png',
    'Subaru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Subaru_logo.svg/120px-Subaru_logo.svg.png',
    'Mitsubishi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mitsubishi_logo.svg/120px-Mitsubishi_logo.svg.png',
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Популярные марки</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Популярные марки</h2>
          <Link
            to="/search"
            className="flex items-center gap-1 text-[#2563eb] hover:text-[#f97316] transition-colors font-medium"
          >
            Все марки
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/search?brand_id=${brand.id}`}
              className="group bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                {brandLogos[brand.name] ? (
                  <img
                    src={brandLogos[brand.name]}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{brand.name[0]}</span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#2563eb] transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
