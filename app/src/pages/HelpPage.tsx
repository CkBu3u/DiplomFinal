import { useState } from 'react';
import { Search, MessageCircle, Phone, Mail, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    category: 'Покупка',
    questions: [
      {
        q: 'Как купить автомобиль на AutoHub?',
        a: 'Найдите подходящий автомобиль через поиск, свяжитесь с продавцом по телефону или через чат, договоритесь об осмотре и совершите сделку.',
      },
      {
        q: 'Как проверить историю автомобиля?',
        a: 'Используйте наш сервис проверки по VIN-коду. Введите VIN на странице "Проверка авто" и получите полный отчет о истории автомобиля.',
      },
      {
        q: 'Можно ли торговаться с продавцом?',
        a: 'Да, многие продавцы указывают "торг уместен" в объявлении. Свяжитесь с продавцом и обсудите условия.',
      },
    ],
  },
  {
    category: 'Продажа',
    questions: [
      {
        q: 'Как разместить объявление?',
        a: 'Нажмите кнопку "Продать" или "Разместить объявление", заполните информацию об автомобиле, добавьте фото и опубликуйте.',
      },
      {
        q: 'Сколько стоит размещение?',
        a: 'Обычное размещение бесплатно. Премиум-размещение стоит 999 рублей и дает приоритет в поиске.',
      },
      {
        q: 'Как долго размещается объявление?',
        a: 'Обычное объявление размещается на 30 дней. Вы можете продлить или поднять объявление в любое время.',
      },
    ],
  },
  {
    category: 'Безопасность',
    questions: [
      {
        q: 'Как избежать мошенничества?',
        a: 'Проверяйте документы на автомобиль, используйте проверку по VIN, встречайтесь с продавцом лично, не отправляйте предоплату.',
      },
      {
        q: 'Что делать, если меня обманули?',
        a: 'Немедленно свяжитесь с нашей службой поддержки. Мы поможем разобраться в ситуации и примем меры против недобросовестного продавца.',
      },
    ],
  },
  {
    category: 'Аккаунт',
    questions: [
      {
        q: 'Как зарегистрироваться?',
        a: 'Нажмите "Войти" в верхнем меню, выберите "Регистрация" и заполните необходимые данные. Можно также войти через Google.',
      },
      {
        q: 'Как изменить данные профиля?',
        a: 'Перейдите в личный кабинет, вкладка "Настройки". Там вы можете изменить контактную информацию и пароль.',
      },
    ],
  },
];

const contacts = [
  {
    icon: Phone,
    title: 'Телефон',
    value: '8 (800) 123-45-67',
    description: 'Бесплатно по России',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'support@autohub.ru',
    description: 'Круглосуточно',
  },
  {
    icon: MessageCircle,
    title: 'Чат',
    value: 'Онлайн чат',
    description: 'Ежедневно 9:00-21:00',
  },
];

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqs);
      return;
    }

    const filtered = faqs.map(category => ({
      ...category,
      questions: category.questions.filter(
        q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
             q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(category => category.questions.length > 0);

    setFilteredFaqs(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2563eb] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Центр помощи</h1>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Найдите ответы на часто задаваемые вопросы или свяжитесь с нами
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white text-gray-900"
              />
            </div>
            <Button type="submit" className="h-12 bg-[#f97316] hover:bg-[#ea580c]">
              Найти
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Часто задаваемые вопросы</h2>
            
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category) => (
                <div key={category.category} className="mb-8">
                  <h3 className="font-semibold text-lg text-gray-700 mb-4">{category.category}</h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, idx) => (
                      <AccordionItem key={idx} value={`${category.category}-${idx}`} className="bg-white rounded-lg border px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-500">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">По вашему запросу ничего не найдено</p>
              </div>
            )}
          </div>

          {/* Contacts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Свяжитесь с нами</h2>
            <div className="space-y-4">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <Card key={contact.title}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#2563eb]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#2563eb]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{contact.value}</div>
                        <div className="text-sm text-gray-500">{contact.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Быстрые ссылки</h3>
                <div className="space-y-2">
                  <a href="/search" className="block text-[#2563eb] hover:underline">Поиск автомобилей</a>
                  <a href="/create-listing" className="block text-[#2563eb] hover:underline">Разместить объявление</a>
                  <a href="/vin-check" className="block text-[#2563eb] hover:underline">Проверка по VIN</a>
                  <a href="/dealers" className="block text-[#2563eb] hover:underline">Автосалоны</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
