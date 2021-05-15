import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

interface Embed {
  embed: MessageEmbed | MessageEmbedOptions;
}

interface GameEvent {
  embed: MessageEmbed | MessageEmbedOptions;
  choices: {
    [name: string]: string;
  };
}

export { GameEvent, Embed };
