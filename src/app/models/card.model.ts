// Розміщення файлу: src/app/models/card.model.ts
export type CardState = 'default' | 'flipped' | 'matched';

export interface CardData {
  id: string; // Унікальний ID для кожної картки в грі
  imageId: number; // ID зображення (щоб знайти пару)
  imageUrl: string;
  state: CardState;
}

// ВИПРАВЛЕНО: Додано експорт інтерфейсу GameLevel для уникнення помилки TS2305
export interface GameLevel {
  name: string;
  pairsCount: number;
  matchSize: number;
  cols: number;
}
