export type CardState = 'default' | 'flipped' | 'matched';

export interface CardData {
  id: string;
  imageId: number;
  imageUrl: string;
  state: CardState;
}
export interface GameLevel {
  name: string;
  pairsCount: number;
  matchSize: number;
  cols: number;
}
