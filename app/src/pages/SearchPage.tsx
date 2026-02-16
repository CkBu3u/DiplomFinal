import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3X3, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ListingCard } from '@/components/ListingCard';
import { getListings, getBrands } from '@/lib/supabase';
import type { Listing, Brand } from '@/lib/supabase';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2024]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedEngineTypes, setSelectedEngineTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedDriveTypes, setSelectedDriveTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const searchQueryFromUrl = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
  }, [searchParams.get('q')]);

  const bodyTypes = [
    { id: 'sedan', name: 'Седан' },
    { id: 'suv', name: 'Внедорожник' },
    { id: 'hatchback', name: 'Хэтчбек' },
    { id: 'wagon', name: 'Универсал' },
    { id: 'coupe', name: 'Купе' },
    { id: 'minivan', name: 'Минивэн' },
    { id: 'pickup', name: 'Пикап' },
    { id: 'convertible', name: 'Кабриолет' },
  ];

  const engineTypes = [
    { id: 'gasoline', name: 'Бензин' },
    { id: 'diesel', name: 'Дизель' },
    { id: 'electric', name: 'Электро' },
    { id: 'hybrid', name: 'Гибрид' },
  ];

  const transmissions = [
    { id: 'manual', name: 'Механика' },
    { id: 'automatic', name: 'Автомат' },
    { id: 'cvt', name: 'Вариатор' },
    { id: 'robot', name: 'Робот' },
  ];

  const driveTypes = [
    { id: 'front', name: 'Передний' },
    { id: 'rear', name: 'Задний' },
    { id: 'full', name: 'Полный' },
    { id: 'part', name: 'Подключаемый' },
  ];

  useEffect(() => {
    const loadBrands = async () => {
      const { data } = await getBrands();
      if (data) setBrands(data);
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      
      const filters: any = {
        page,
        limit: 20,
        sortBy,
      };

      // Parse URL params
      const brandId = searchParams.get('brand_id');
      const modelId = searchParams.get('model_id');
      const yearMin = searchParams.get('year_min');
      const yearMax = searchParams.get('year_max');
      const priceMin = searchParams.get('price_min');
      const priceMax = searchParams.get('price_max');
      const bodyType = searchParams.get('body_type');
      const q = searchParams.get('q');

      if (brandId) filters.brand_id = parseInt(brandId);
      if (modelId) filters.model_id = parseInt(modelId);
      if (yearMin) filters.year_min = parseInt(yearMin);
      if (yearMax) filters.year_max = parseInt(yearMax);
      if (priceMin) filters.price_min = parseInt(priceMin);
      if (priceMax) filters.price_max = parseInt(priceMax);
      if (bodyType) filters.body_type = bodyType;
      if (q?.trim()) filters.search = q.trim();

      if (selectedBrands.length > 0) filters.brand_id = selectedBrands[0];
      if (selectedModels.length > 0) filters.model_id = selectedModels[0];
      if (selectedBodyTypes.length > 0) filters.body_type = selectedBodyTypes[0];
      if (selectedEngineTypes.length > 0) filters.engine_type = selectedEngineTypes[0];
      if (selectedTransmissions.length > 0) filters.transmission = selectedTransmissions[0];
      if (selectedDriveTypes.length > 0) filters.drive_type = selectedDriveTypes[0];

      filters.price_min = priceRange[0];
      filters.price_max = priceRange[1];
      filters.year_min = yearRange[0];
      filters.year_max = yearRange[1];

      const { data } = await getListings(filters);
      if (data) {
        setListings(data);
        setTotalCount(data.length);
      }
      setIsLoading(false);
    };

    loadListings();
  }, [searchParams, selectedBrands, selectedModels, priceRange, yearRange, selectedBodyTypes, selectedEngineTypes, selectedTransmissions, selectedDriveTypes, sortBy, page]);

  const handleBrandToggle = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleBodyTypeToggle = (type: string) => {
    setSelectedBodyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedModels([]);
    setPriceRange([0, 20000000]);
    setYearRange([1990, 2024]);
    setSelectedBodyTypes([]);
    setSelectedEngineTypes([]);
    setSelectedTransmissions([]);
    setSelectedDriveTypes([]);
    setSearchParams({});
  };

  const activeFiltersCount = selectedBrands.length + selectedBodyTypes.length + selectedEngineTypes.length + selectedTransmissions.length + selectedDriveTypes.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      next.set('q', searchQuery.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Марка</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.id);
            return (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleBrandToggle(brand.id)}
                  aria-label={brand.name}
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Цена</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={20000000}
            step={100000}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              placeholder="От"
            />
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 20000000])}
              placeholder="До"
            />
          </div>
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="font-semibold mb-3">Год выпуска</h3>
        <div className="px-2">
          <Slider
            value={yearRange}
            onValueChange={(value) => setYearRange(value as [number, number])}
            min={1990}
            max={2024}
            step={1}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={yearRange[0]}
              onChange={(e) => setYearRange([parseInt(e.target.value) || 1990, yearRange[1]])}
              placeholder="От"
            />
            <Input
              type="number"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value) || 2024])}
              placeholder="До"
            />
          </div>
        </div>
      </div>

      {/* Body Types */}
      <div>
        <h3 className="font-semibold mb-3">Тип кузова</h3>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((type) => (
            <div
              key={type.id}
              className={`body-type-option p-3 cursor-pointer ${
                selectedBodyTypes.includes(type.id) ? 'selected' : ''
              }`}
              onClick={() => handleBodyTypeToggle(type.id)}
            >
              <span className="text-sm">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engine Type */}
      <div>
        <h3 className="font-semibold mb-3">Тип двигателя</h3>
        <div className="space-y-2">
          {engineTypes.map((type) => {
            const isChecked = selectedEngineTypes.includes(type.id);
            return (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => setSelectedEngineTypes(prev =>
                    prev.includes(type.id) ? prev.filter(t => t !== type.id) : [...prev, type.id]
                  )}
                  aria-label={type.name}
                />
                <span className="text-sm">{type.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <h3 className="font-semibold mb-3">Коробка передач</h3>
        <div className="space-y-2">
          {transmissions.map((type) => {
            const isChecked = selectedTransmissions.includes(type.id);
            return (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => setSelectedTransmissions(prev =>
                    prev.includes(type.id) ? prev.filter(t => t !== type.id) : [...prev, type.id]
                  )}
                  aria-label={type.name}
                />
                <span className="text-sm">{type.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Drive Type */}
      <div>
        <h3 className="font-semibold mb-3">Привод</h3>
        <div className="space-y-2">
          {driveTypes.map((type) => {
            const isChecked = selectedDriveTypes.includes(type.id);
            return (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => setSelectedDriveTypes(prev =>
                    prev.includes(type.id) ? prev.filter(t => t !== type.id) : [...prev, type.id]
                  )}
                  aria-label={type.name}
                />
                <span className="text-sm">{type.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        <X className="w-4 h-4 mr-2" />
        Сбросить фильтры
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Поиск автомобилей</h1>
            <p className="text-gray-500 mt-1">
              Найдено {totalCount} объявлений
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Фильтры
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">По дате</SelectItem>
                <SelectItem value="price">По цене (возр.)</SelectItem>
                <SelectItem value="price_desc">По цене (убыв.)</SelectItem>
                <SelectItem value="year">По году (возр.)</SelectItem>
                <SelectItem value="year_desc">По году (убыв.)</SelectItem>
                <SelectItem value="mileage">По пробегу</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="filter-sidebar bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Фильтры</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Search bar above cars, left of filter column */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по марке, модели, описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm"
                />
              </div>
            </form>

            {isLoading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`skeleton rounded-2xl ${viewMode === 'grid' ? 'h-96' : 'h-48'}`} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} view={viewMode} />
                  ))}
                </div>

                {/* Load More */}
                {listings.length >= 20 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Загрузить еще
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <SlidersHorizontal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Объявления не найдены
                </h3>
                <p className="text-gray-500 mb-4">
                  Попробуйте изменить параметры фильтров
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
