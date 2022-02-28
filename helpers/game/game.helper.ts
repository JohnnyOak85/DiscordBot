import { GuildChannel, TextChannel } from 'discord.js';
import { listDocs } from '../tools/database.helper';
import { spawnMonster } from './monster.helper';

export const startAreas = async (channels: GuildChannel[]) => {
  const areas = await listDocs('game/areas');

  for (const name of areas) {
    const area = channels.find((channel) => channel.name === name && channel.type === 'text');

    if (!area) continue;

    spawnMonster(area as TextChannel);
  }
};
