import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getBrands, getModelsByBrand } from '@/lib/supabase';
import type { Brand, Model } from '@/lib/supabase';

const EMPTY_SELECT = '__none__';

export function Hero() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(EMPTY_SELECT);
  const [selectedModel, setSelectedModel] = useState<string>(EMPTY_SELECT);
  const [yearFrom, setYearFrom] = useState<string>(EMPTY_SELECT);
  const [yearTo, setYearTo] = useState<string>(EMPTY_SELECT);
  const [priceFrom, setPriceFrom] = useState<string>('');
  const [priceTo, setPriceTo] = useState<string>('');

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const { data } = await getBrands();
        if (data) setBrands(data);
      } catch {
        setBrands([]);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      if (selectedBrand && selectedBrand !== EMPTY_SELECT) {
        try {
          const brandId = parseInt(selectedBrand);
          const { data } = await getModelsByBrand(brandId);
          if (data) setModels(data);
          else setModels([]);
        } catch {
          setModels([]);
        }
      } else {
        setModels([]);
      }
      setSelectedModel(EMPTY_SELECT);
    };
    loadModels();
  }, [selectedBrand]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedBrand && selectedBrand !== EMPTY_SELECT) params.append('brand_id', selectedBrand);
    if (selectedModel && selectedModel !== EMPTY_SELECT) params.append('model_id', selectedModel);
    if (yearFrom && yearFrom !== EMPTY_SELECT) params.append('year_min', yearFrom);
    if (yearTo && yearTo !== EMPTY_SELECT) params.append('year_max', yearTo);
    if (priceFrom) params.append('price_min', priceFrom);
    if (priceTo) params.append('price_max', priceTo);
    
    navigate(`/search?${params.toString()}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  return (
    <section className="hero-section min-h-[700px]">
      {/* Background Image */}
      <div 
        className="hero-bg"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="hero-overlay" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Найдите свой идеальный автомобиль
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10">
            Более 100 000 объявлений от частных продавцов и дилеров
          </p>

          {/* Search Panel */}
          <div className="search-panel p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Brand */}
              <div className="lg:col-span-1">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Марка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT}>Все марки</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div className="lg:col-span-1">
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={!selectedBrand || selectedBrand === EMPTY_SELECT}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Модель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT}>Все модели</SelectItem>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year From */}
              <div className="lg:col-span-1">
                <Select value={yearFrom} onValueChange={setYearFrom}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Год от" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT}>От</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year To */}
              <div className="lg:col-span-1">
                <Select value={yearTo} onValueChange={setYearTo}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Год до" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_SELECT}>До</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="lg:col-span-1">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Цена от"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1">
                <Button
                  onClick={handleSearch}
                  className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Найти
                </Button>
              </div>
            </div>

            {/* Price range slider - desktop only */}
            <div className="hidden lg:block mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 whitespace-nowrap">Цена:</span>
                <Input
                  type="number"
                  placeholder="от"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-32 h-10"
                />
                <span className="text-gray-400">—</span>
                <Input
                  type="number"
                  placeholder="до"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="w-32 h-10"
                />
                <span className="text-sm text-gray-500">₽</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100K+</div>
              <div className="text-white/70 text-sm">Объявлений</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/70 text-sm">Продавцов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-white/70 text-sm">Марок авто</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-white/70 text-sm">Довольных клиентов</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
