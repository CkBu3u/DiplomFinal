import { useEffect, useRef, useState } from 'react';
import { Search, MessageCircle, HandshakeIcon, ArrowRight } from 'lucide-react';

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Search,
    title: 'Найдите авто',
    description: 'Используйте фильтры для поиска идеального автомобиля по марке, модели, цене и другим параметрам.',
  },
  {
    number: 2,
    icon: MessageCircle,
    title: 'Свяжитесь с продавцом',
    description: 'Напишите или позвоните продавцу, задайте вопросы и договоритесь об осмотре.',
  },
  {
    number: 3,
    icon: HandshakeIcon,
    title: 'Осмотрите и купите',
    description: 'Проверьте автомобиль, оформите сделку и становитесь счастливым владельцем.',
  },
];

export function HowItWorks() {
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
    <section ref={sectionRef} className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Как это работает
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Всего три простых шага отделяют вас от покупки вашего идеального автомобиля
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#2563eb] via-[#f97316] to-[#2563eb]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const delay = index * 200;

              return (
                <div
                  key={step.number}
                  className={`step-card relative transition-all duration-500 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {/* Step Number */}
                  <div className="step-number relative z-10">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>

                  {/* Arrow - Mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <ArrowRight className="w-6 h-6 text-[#f97316]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2563eb]/25 transition-all hover:-translate-y-0.5"
          >
            Начать поиск
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
