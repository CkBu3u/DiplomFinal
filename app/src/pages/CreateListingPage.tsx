import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Upload, Check, Car, 
  Settings, Phone, Crown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, getBrands, getModelsByBrand, createListing, supabase } from '@/lib/supabase';
import type { Brand, Model } from '@/lib/supabase';

const steps = [
  { id: 1, title: 'Автомобиль', icon: Car },
  { id: 2, title: 'Характеристики', icon: Settings },
  { id: 3, title: 'Комплектация', icon: Check },
  { id: 4, title: 'Фото и описание', icon: Upload },
  { id: 5, title: 'Цена и контакты', icon: Phone },
  { id: 6, title: 'Публикация', icon: Crown },
];

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
];

const colors = [
  { id: 'black', name: 'Черный', hex: '#000000' },
  { id: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: 'silver', name: 'Серебристый', hex: '#C0C0C0' },
  { id: 'gray', name: 'Серый', hex: '#808080' },
  { id: 'red', name: 'Красный', hex: '#FF0000' },
  { id: 'blue', name: 'Синий', hex: '#0000FF' },
  { id: 'green', name: 'Зеленый', hex: '#008000' },
  { id: 'brown', name: 'Коричневый', hex: '#8B4513' },
  { id: 'beige', name: 'Бежевый', hex: '#F5F5DC' },
  { id: 'yellow', name: 'Желтый', hex: '#FFFF00' },
  { id: 'orange', name: 'Оранжевый', hex: '#FFA500' },
  { id: 'purple', name: 'Фиолетовый', hex: '#800080' },
];

const features = [
  'Кондиционер', 'Климат-контроль', 'Подогрев сидений', 'Вентиляция сидений',
  'Круиз-контроль', 'Парктроники', 'Камера заднего вида', 'Навигация',
  'Bluetooth', 'Легкосплавные диски', 'Панорамная крыша', 'Люк',
  'Кожаный салон', 'ABS', 'ESP', 'Подушки безопасности',
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    brand_id: '',
    model_id: '',
    year: '',
    body_type: '',
    engine_type: '',
    engine_volume: '',
    engine_power: '',
    transmission: '',
    drive_type: '',
    mileage: '',
    condition: 'used',
    owners_count: '1',
    color: '',
    color_metallic: false,
    city: '',
    title: '',
    description: '',
    price: '',
    negotiable: false,
    exchange: false,
    contact_phone: '',
    contact_name: '',
    is_premium: false,
    selectedFeatures: [] as string[],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();

    const loadBrands = async () => {
      const { data } = await getBrands();
      if (data) setBrands(data);
    };
    loadBrands();
  }, [navigate]);

  useEffect(() => {
    const loadModels = async () => {
      if (formData.brand_id) {
        const { data } = await getModelsByBrand(parseInt(formData.brand_id));
        if (data) setModels(data);
      } else {
        setModels([]);
      }
    };
    loadModels();
  }, [formData.brand_id]);

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const listingData = {
        user_id: user.id,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : undefined,
        model_id: formData.model_id ? parseInt(formData.model_id) : undefined,
        year: parseInt(formData.year),
        price: parseInt(formData.price),
        body_type: formData.body_type,
        engine_type: formData.engine_type,
        engine_volume: formData.engine_volume ? parseFloat(formData.engine_volume) : undefined,
        engine_power: formData.engine_power ? parseInt(formData.engine_power) : undefined,
        transmission: formData.transmission,
        drive_type: formData.drive_type,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        condition: formData.condition as 'new' | 'used',
        owners_count: parseInt(formData.owners_count) || 1,
        color: formData.color,
        color_metallic: formData.color_metallic,
        city: formData.city,
        title: formData.title || [brands.find(b => b.id.toString() === formData.brand_id)?.name, formData.model_id ? models.find(m => m.id.toString() === formData.model_id)?.name : null, formData.year].filter(Boolean).join(' '),
        description: formData.description,
        contact_phone: formData.contact_phone,
        contact_name: formData.contact_name,
        is_premium: formData.is_premium,
        status: 'active' as const,
      };

      const { data: listing, error } = await createListing(listingData);
      
      if (error) throw error;
      
      if (listing) {
        // Upload images
        for (let i = 0; i < uploadedImages.length; i++) {
          const file = uploadedImages[i];
          const fileName = `${listing.id}/${Date.now()}_${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, file);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(fileName);
            
            await supabase.from('listing_images').insert({
              listing_id: listing.id,
              image_url: publicUrl,
              is_main: i === 0,
              sort_order: i,
            });
          }
        }
        
        navigate(`/listing/${listing.id}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Список полей, которые нужно заполнить для публикации */
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.brand_id) missing.push('Марка автомобиля');
    if (!formData.year) missing.push('Год выпуска');
    if (!formData.price || formData.price === '0') missing.push('Цена');
    if (!formData.contact_phone?.trim() && !formData.contact_name?.trim()) missing.push('Телефон или имя для контакта');
    return missing;
  };

  const missingFields = getMissingFields();
  const canPublish = missingFields.length === 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedImages(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Размещение объявления</h1>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      currentStep > step.id ? 'bg-[#2563eb]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <span
                key={step.id}
                className={currentStep >= step.id ? 'text-[#2563eb] font-medium' : 'text-gray-400'}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Step 1: Car Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Выберите автомобиль</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Марка *</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value, model_id: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите марку" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Модель</Label>
                  <Select
                    value={formData.model_id || '__none__'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, model_id: value === '__none__' ? '' : value }))}
                    disabled={!formData.brand_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.brand_id ? (models.length ? 'Выберите модель' : 'Нет моделей в базе') : 'Сначала выберите марку'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Не указана</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Год выпуска *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите год" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Состояние</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новое</SelectItem>
                      <SelectItem value="used">С пробегом</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specifications */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Технические характеристики</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Тип кузова</Label>
                  <Select
                    value={formData.body_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, body_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип кузова" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Пробег (км)</Label>
                  <Input
                    type="number"
                    placeholder="Например: 50000"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Тип двигателя</Label>
                  <Select
                    value={formData.engine_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, engine_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип двигателя" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Объем двигателя (л)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Например: 2.0"
                    value={formData.engine_volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, engine_volume: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Мощность (л.с.)</Label>
                  <Input
                    type="number"
                    placeholder="Например: 150"
                    value={formData.engine_power}
                    onChange={(e) => setFormData(prev => ({ ...prev, engine_power: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Коробка передач</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите КПП" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Привод</Label>
                  <Select
                    value={formData.drive_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, drive_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите привод" />
                    </SelectTrigger>
                    <SelectContent>
                      {driveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Количество владельцев</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.owners_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, owners_count: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Цвет</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цвет" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metallic"
                    checked={formData.color_metallic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, color_metallic: checked as boolean }))}
                  />
                  <Label htmlFor="metallic">Металлик</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Features */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Комплектация</h2>
              <p className="text-gray-500">Выберите опции, установленные в автомобиле</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedFeatures.includes(feature)
                        ? 'border-[#2563eb] bg-[#2563eb]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFeature(feature)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.selectedFeatures.includes(feature)} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Photos & Description */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Фото и описание</h2>
              
              {/* Photo Upload */}
              <div>
                <Label>Фотографии автомобиля</Label>
                <div className="mt-2">
                  <div className="dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Перетащите фото сюда или нажмите для выбора</p>
                      <p className="text-gray-400 text-sm mt-1">До 20 фотографий</p>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                    {uploadedImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                        >
                          ×
                        </button>
                        {idx === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Главное</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <Label>Заголовок объявления</Label>
                <Input
                  placeholder="Например: Toyota Camry 2020 в отличном состоянии"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <Label>Описание</Label>
                <Textarea
                  placeholder="Опишите состояние автомобиля, историю обслуживания, причину продажи..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 5: Price & Contacts */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Цена и контакты</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Цена (₽) *</Label>
                  <Input
                    type="number"
                    placeholder="Например: 1500000"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Город *</Label>
                  <Input
                    placeholder="Например: Москва"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Контактное имя</Label>
                  <Input
                    placeholder="Ваше имя"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Телефон *</Label>
                  <Input
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, negotiable: checked as boolean }))}
                  />
                  <Label htmlFor="negotiable">Торг уместен</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exchange"
                    checked={formData.exchange}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, exchange: checked as boolean }))}
                  />
                  <Label htmlFor="exchange">Возможен обмен</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Publish */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Публикация</h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Предпросмотр объявления</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Автомобиль:</span> {[brands.find(b => b.id.toString() === formData.brand_id)?.name, formData.model_id ? models.find(m => m.id.toString() === formData.model_id)?.name : null, formData.year].filter(Boolean).join(' ') || '—'}</p>
                  <p><span className="text-gray-500">Цена:</span> {formData.price ? parseInt(formData.price).toLocaleString('ru-RU') : '-'} ₽</p>
                  <p><span className="text-gray-500">Город:</span> {formData.city || '-'}</p>
                  <p><span className="text-gray-500">Пробег:</span> {formData.mileage ? `${parseInt(formData.mileage).toLocaleString('ru-RU')} км` : '-'}</p>
                  <p><span className="text-gray-500">Фотографий:</span> {uploadedImages.length}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Выберите тариф</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      !formData.is_premium ? 'border-[#2563eb] bg-[#2563eb]/5' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, is_premium: false }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Обычное</span>
                      {!formData.is_premium && <Check className="w-5 h-5 text-[#2563eb]" />}
                    </div>
                    <p className="text-gray-500 text-sm">Бесплатно</p>
                    <p className="text-gray-400 text-xs mt-1">Стандартное размещение на 30 дней</p>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      formData.is_premium ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, is_premium: true }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Премиум
                      </span>
                      {formData.is_premium && <Check className="w-5 h-5 text-amber-500" />}
                    </div>
                    <p className="text-amber-600 font-medium">999 ₽</p>
                    <p className="text-gray-400 text-xs mt-1">Выделенное объявление, топ позиции</p>
                  </div>
                </div>
              </div>

              {missingFields.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="font-semibold text-amber-800 mb-2">Для публикации заполните:</p>
                  <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
                    {missingFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>

            {currentStep < 6 ? (
              <Button onClick={handleNext} className="bg-[#f97316] hover:bg-[#ea580c]">
                Далее
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !canPublish}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
