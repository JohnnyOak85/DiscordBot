interface UserDoc {
  _id: string;
  anniversary?: Date;
  joinedAt: Date | null;
  nickname: string | null;
  roles: string[];
  strikes: string[];
  timer?: string;
  username: string;
}
