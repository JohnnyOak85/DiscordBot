import { MessageEmbed } from 'discord.js';

interface Embed {
  description?: string;
  title: string;
}

export const buildEmbed = (embed: Embed, color = 'DEFAULT', path = '') =>
  new MessageEmbed(embed).setColor(color).setThumbnail(path);
