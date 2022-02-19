import { MessageEmbed } from 'discord.js';

import { getDoc } from './storage.helper';

export const getEmbed = async (embed: string) => {
  const doc = await getDoc<any>('configurations/embeds');

  return new MessageEmbed(doc[embed]);
};
