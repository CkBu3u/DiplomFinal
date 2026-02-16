import { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VinCheckPage() {
  const [vin, setVin] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vin.length < 17) return;

    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        vin: vin.toUpperCase(),
        found: true,
        records: [
          { type: 'registration', date: '2020-03-15', description: 'Постановка на учет' },
          { type: 'insurance', date: '2021-01-10', description: 'Оформление ОСАГО' },
          { type: 'service', date: '2022-06-20', description: 'ТО-30 000 км' },
        ],
        accidents: 0,
        owners: 2,
        mileage: 45000,
        wanted: false,
        restricted: false,
      });
      setIsChecking(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2563eb] to-[#f97316] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Проверка автомобиля по VIN
          </h1>
          <p className="text-gray-500 text-lg">
            Узнайте историю автомобиля перед покупкой. Проверка на ДТП, залоги, 
            ограничения и многое другое.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleCheck} className="flex gap-2">
            <Input
              type="text"
              placeholder="Введите VIN-код (17 символов)"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className="h-14 text-lg uppercase tracking-wider font-mono"
              maxLength={17}
            />
            <Button
              type="submit"
              className="h-14 px-8 bg-[#f97316] hover:bg-[#ea580c]"
              disabled={vin.length < 17 || isChecking}
            >
              {isChecking ? 'Проверка...' : <Search className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-sm text-gray-400 mt-2 text-center">
            VIN-код находится в ПТС, СТС или на кузове автомобиля
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Результат проверки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.accidents}</div>
                    <div className="text-sm text-gray-500">ДТП</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.owners}</div>
                    <div className="text-sm text-gray-500">Владельцев</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(result.mileage / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-500">Пробег, км</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-gray-500">Не в угоне</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  История записей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.records.map((record: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium">{record.description}</div>
                        <div className="text-sm text-gray-500">{record.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Проверка на ДТП</h3>
                <p className="text-gray-500 text-sm">
                  Узнайте о всех зарегистрированных авариях и страховых случаях
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Shield className="w-10 h-10 text-green-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Проверка на залог</h3>
                <p className="text-gray-500 text-sm">
                  Проверьте, не находится ли автомобиль в залоге у банка
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <CheckCircle className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">История пробега</h3>
                <p className="text-gray-500 text-sm">
                  Проверьте актуальность пробега по данным ТО и страховок
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
