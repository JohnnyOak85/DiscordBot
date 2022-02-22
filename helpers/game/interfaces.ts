export interface Duelist {
  attack: number;
  defense: number;
  health: number;
  level: number;
  name: string;
}

export interface Monster extends Duelist {
  file: string;
}

export interface Player extends Duelist {
  id: string;
}
