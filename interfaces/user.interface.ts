interface UserDoc {
  _id?: string;
  anniversary?: Date;
  attack?: number;
  defense?: number;
  joinedAt?: Date | null;
  health?: number;
  level?: number;
  nickname?: string | null;
  roles?: string[];
  strikes?: string[];
  timer?: string;
  username?: string;
}
