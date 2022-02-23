export interface DataList {
  [prop: string]: string;
}

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
