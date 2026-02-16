import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Русские названия для типа двигателя (в БД хранятся на латинице) */
const ENGINE_RU: Record<string, string> = {
  gasoline: 'Бензин',
  diesel: 'Дизель',
  electric: 'Электро',
  hybrid: 'Гибрид',
  бензин: 'Бензин',
  дизель: 'Дизель',
  электро: 'Электро',
  гибрид: 'Гибрид',
};
/** Русские названия для коробки передач */
const TRANSMISSION_RU: Record<string, string> = {
  manual: 'Механика',
  automatic: 'Автомат',
  cvt: 'Вариатор',
  robot: 'Робот',
  механика: 'Механика',
  автомат: 'Автомат',
  вариатор: 'Вариатор',
  робот: 'Робот',
};
/** Русские названия для типа привода */
const DRIVE_RU: Record<string, string> = {
  front: 'Передний',
  rear: 'Задний',
  full: 'Полный',
  part: 'Подключаемый',
  передний: 'Передний',
  задний: 'Задний',
  полный: 'Полный',
  подключаемый: 'Подключаемый',
};
/** Русские названия для типа кузова */
const BODY_RU: Record<string, string> = {
  sedan: 'Седан',
  suv: 'Внедорожник',
  hatchback: 'Хэтчбек',
  wagon: 'Универсал',
  coupe: 'Купе',
  minivan: 'Минивэн',
  pickup: 'Пикап',
  convertible: 'Кабриолет',
  седан: 'Седан',
  внедорожник: 'Внедорожник',
  хэтчбек: 'Хэтчбек',
  универсал: 'Универсал',
  купе: 'Купе',
  минивэн: 'Минивэн',
  пикап: 'Пикап',
  кабриолет: 'Кабриолет',
};

export function engineTypeToRu(value?: string | null): string {
  if (!value) return '';
  return ENGINE_RU[value.toLowerCase()] ?? value;
}
export function transmissionToRu(value?: string | null): string {
  if (!value) return '';
  return TRANSMISSION_RU[value.toLowerCase()] ?? value;
}
export function driveTypeToRu(value?: string | null): string {
  if (!value) return '';
  return DRIVE_RU[value.toLowerCase()] ?? value;
}
export function bodyTypeToRu(value?: string | null): string {
  if (!value) return '';
  return BODY_RU[value.toLowerCase()] ?? value;
}
