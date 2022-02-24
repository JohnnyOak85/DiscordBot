import { MessageEmbed } from 'discord.js';

interface Embed {
  color?: string;
  description?: string;
  title: string;
  thumb?: string | null;
  url?: string;
}

export const buildEmbed = (embed: Embed) =>
  new MessageEmbed()
    .setColor(embed.color || 'DEFAULT')
    .setThumbnail(embed.thumb || '')
    .setTitle(embed.title || '')
    .setURL(embed.url || '')
    .setDescription(embed.description || '');
