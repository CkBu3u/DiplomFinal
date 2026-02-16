import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  const footerLinks = {
    about: [
      { label: 'О компании', href: '/about' },
      { label: 'Карьера', href: '#' },
      { label: 'Новости', href: '/blog' },
      { label: 'Контакты', href: '/about#contacts' },
    ],
    buyer: [
      { label: 'Как купить', href: '/help' },
      { label: 'Поиск авто', href: '/search' },
      { label: 'Проверка по VIN', href: '/vin-check' },
      { label: 'Сравнение', href: '/compare' },
    ],
    seller: [
      { label: 'Как продать', href: '/help' },
      { label: 'Подать объявление', href: '/create-listing' },
      { label: 'Тарифы', href: '#' },
      { label: 'Для дилеров', href: '/dealers' },
    ],
    support: [
      { label: 'Помощь', href: '/help' },
      { label: 'Безопасность', href: '#' },
      { label: 'Правила', href: '#' },
      { label: 'Политика конфиденциальности', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-[#1a365d] text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#f97316] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl">AutoHub</span>
            </Link>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Современная платформа для покупки и продажи автомобилей. 
              Более 100 000 объявлений от частных продавцов и дилеров.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>8 (800) 123-45-67</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@autohub.ru</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Москва, ул. Автомобильная, 1</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f97316] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold mb-4">О нас</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Покупателю</h3>
            <ul className="space-y-2">
              {footerLinks.buyer.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Продавцу</h3>
            <ul className="space-y-2">
              {footerLinks.seller.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold mb-1">Подпишитесь на рассылку</h3>
              <p className="text-gray-300 text-sm">
                Получайте новые объявления и специальные предложения
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Ваш email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 flex-1 lg:w-64"
              />
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white whitespace-nowrap">
                Подписаться
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AutoHub. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
