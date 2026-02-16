import { useEffect, useRef, useState } from 'react';
import { Car, ShieldCheck, Search, Lock } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const features: Feature[] = [
  {
    icon: Car,
    title: 'Большой выбор',
    description: 'Более 100 000 актуальных объявлений от частных продавцов и дилеров по всей стране.',
    stat: '100K+',
    statLabel: 'Объявлений',
  },
  {
    icon: ShieldCheck,
    title: 'Проверенные продавцы',
    description: 'Все продавцы проходят верификацию. Читайте отзывы и выбирайте надежных партнеров.',
    stat: '50K+',
    statLabel: 'Продавцов',
  },
  {
    icon: Search,
    title: 'История автомобиля',
    description: 'Проверяйте историю авто по VIN-коду перед покупкой. Узнайте о ДТП, залогах и пробеге.',
    stat: '99%',
    statLabel: 'Точность данных',
  },
  {
    icon: Lock,
    title: 'Безопасная сделка',
    description: 'Гарантии безопасности при покупке и продаже. Защита от мошенников.',
    stat: '0%',
    statLabel: 'Мошенничества',
  },
];

export function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Почему выбирают AutoHub
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Мы создали платформу, где покупка и продажа автомобилей становится простой и безопасной
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const delay = index * 100;

            return (
              <div
                key={feature.title}
                className={`feature-card text-center transition-all duration-500 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${delay}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2563eb]/10 to-[#f97316]/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#2563eb]" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-bold text-[#f97316]">
                    {feature.stat}
                  </div>
                  <div className="text-sm text-gray-400">
                    {feature.statLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
