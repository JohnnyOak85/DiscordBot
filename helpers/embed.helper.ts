import { EmbedFieldData, MessageEmbed } from 'discord.js';

interface Embed {
  color?: string;
  description?: string;
  fieldName?: string;
  fieldValue?: string;
  fields?: EmbedFieldData[];
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
    .addField(embed.fieldName || '', embed.fieldValue || '')
    .setDescription(embed.description || '');
