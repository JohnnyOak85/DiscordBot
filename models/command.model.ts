interface Command {
  description: string;
  execute: Function;
  moderation: boolean;
  name: string;
  usage: string;
}
