import { GuildChannel, TextChannel } from 'discord.js';
import { spawnMonster } from './monster.helper';

const areas = ['cave'];

export const startAreas = async (channels: GuildChannel[]) => {
  for (const name of areas) {
    const area = channels.find((channel) => channel.name === name && channel.type === 'text');

    if (!area) continue;

    spawnMonster(area as TextChannel);
  }
};
