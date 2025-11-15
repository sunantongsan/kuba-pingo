// Fix for window.Telegram
declare global {
  interface Window {
    Telegram: any;
  }
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface BingoCell {
  number: number | 'FREE';
  marked: boolean;
}

export interface PlayerProfile {
  name: string;
}