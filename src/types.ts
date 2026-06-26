export enum GameScreen {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  OPTIONS = 'OPTIONS',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  GAME_OVER = 'GAME_OVER',
  ENDING = 'ENDING'
}

export type ControlKeys = {
  left: string;
  right: string;
  jump: string;
  action: string;
};

export type PlayerSkin = {
  id: string;
  name: string;
  color: string;
  maskColor: string;
  glowColor: string;
  speedMultiplier: number;
};

export type GameOptions = {
  controls: ControlKeys;
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  selectedSkinId: string;
  showOnScreenButtons: boolean;
};

export type ScoreRecord = {
  score: number;
  date: string;
  playerName: string;
};
