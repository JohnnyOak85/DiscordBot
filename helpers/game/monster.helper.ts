import { TextChannel } from 'discord.js';

import { CollectionFactory } from '../../factories/collection.factory';
import { buildEmbed } from '../tools/embed.helper';
import { docExists, getDoc } from '../tools/database.helper';
import { getRandom } from '../tools/utils.helper';
import { startRounds } from './duel.helper';

import { Duelist } from '../../interfaces';
import { ensureDuelist } from './player';

interface Monster extends Duelist {
  thumb: string;
}

const monsters = new CollectionFactory<{ monster: Duelist; timer: NodeJS.Timeout }>();

const cleanUpDuel = (name: string) => {
  const timer = monsters.getItem(name)?.timer;

  if (timer) monsters.clearTimer(name, timer);
};

const selectMonster = async (area: string) => {
  const list = await getDoc<Monster[]>('game/areas', area);
  const chance = getRandom();

  if (chance < 25) {
    return list[0];
  } else if (chance < 55) {
    return list[getRandom(4)];
  } else if (chance < 75) {
    return list[getRandom(6, 5)];
  } else if (chance < 95) {
    return list[getRandom(8, 7)];
  } else {
    return list[9];
  }
};

export const spawnMonster = async (channel: TextChannel) => {
  if (!(await docExists('game/areas', channel.name))) return;

  const timer = setInterval(async () => {
    const monster = await selectMonster(channel.name);
    const embed = buildEmbed({
      color: '#ff2050',
      description: `A ${monster.name} appears!`,
      title: '**MONSTER ATTACK**',
      thumb: monster.thumb
    });

    monsters.addItem(channel.name, { monster, timer });

    channel.send(embed);
    // }, 60000);
  }, 30000);
};

export const engageMonster = async (channel: TextChannel, challengerId: string) => {
  const monster = monsters.getItem(channel.name)?.monster;
  const challenger = await ensureDuelist(channel.guild.id, challengerId);

  cleanUpDuel(channel.name);

  if (!monster || !challenger) return;

  monster.luck = monster.luck || 1;

  startRounds(challenger, monster, channel);
  spawnMonster(channel);
};
