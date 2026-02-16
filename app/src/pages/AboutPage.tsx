import { useEffect } from 'react';
import { Target, Users, Shield, TrendingUp, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { value: '100K+', label: 'Объявлений' },
  { value: '50K+', label: 'Продавцов' },
  { value: '1M+', label: 'Пользователей' },
  { value: '98%', label: 'Довольных клиентов' },
];

const values = [
  {
    icon: Target,
    title: 'Наша миссия',
    description: 'Сделать покупку и продажу автомобилей простой, безопасной и прозрачной для каждого.',
  },
  {
    icon: Users,
    title: 'Наша команда',
    description: 'Профессионалы с многолетним опытом в автомобильной индустрии и технологиях.',
  },
  {
    icon: Shield,
    title: 'Надежность',
    description: 'Все объявления проходят проверку, а продавцы верифицируются.',
  },
  {
    icon: TrendingUp,
    title: 'Развитие',
    description: 'Постоянно совершенствуем сервис и добавляем новые возможности.',
  },
];

const team = [
  { name: 'Александр Петров', role: 'CEO', initials: 'АП' },
  { name: 'Елена Смирнова', role: 'COO', initials: 'ЕС' },
  { name: 'Дмитрий Иванов', role: 'CTO', initials: 'ДИ' },
  { name: 'Мария Козлова', role: 'Head of Marketing', initials: 'МК' },
];

export function AboutPage() {
  useEffect(() => {
    if (window.location.hash === '#contacts') {
      const el = document.getElementById('contacts');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2563eb] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">О компании AutoHub</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Крупнейший автомобильный маркетплейс в России. 
            Мы объединяем покупателей и продавцов с 2020 года.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-[#f97316]">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Наши ценности</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#f97316] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contacts */}
      <div id="contacts" className="scroll-mt-24 bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Phone className="w-10 h-10 text-[#2563eb]" />
                <div>
                  <div className="font-semibold">Телефон</div>
                  <a href="tel:88001234567" className="text-[#2563eb] hover:underline">8 (800) 123-45-67</a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Mail className="w-10 h-10 text-[#2563eb]" />
                <div>
                  <div className="font-semibold">Email</div>
                  <a href="mailto:support@autohub.ru" className="text-[#2563eb] hover:underline">support@autohub.ru</a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <MapPin className="w-10 h-10 text-[#2563eb]" />
                <div>
                  <div className="font-semibold">Адрес</div>
                  <span className="text-gray-600">Москва, ул. Автомобильная, 1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Наша команда</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {member.initials}
                </div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#2563eb] to-[#f97316] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Присоединяйтесь к AutoHub</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            Станьте частью крупнейшего автомобильного сообщества. 
            Продавайте и покупайте автомобили с удовольствием.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/search"
              className="px-8 py-3 bg-white text-[#2563eb] font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Найти авто
            </a>
            <a
              href="/create-listing"
              className="px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              Разместить объявление
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
