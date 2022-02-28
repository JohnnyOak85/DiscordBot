import { Message } from 'discord.js';

import { engageMonster } from '../helpers/game/monster.helper';
import { logError } from '../helpers/tools/utils.helper';

import { NAME } from '../game-config.json';

module.exports = {
  name: 'attack',
  description: `Attack a spawned monster! Only works in ${NAME}`,
  usage: ' ',
  moderation: false,
  game: true,
  execute: async (message: Message) => {
    try {
      if (message.channel.type !== 'text') return;

      engageMonster(message.channel, message.author.id);
    } catch (error) {
      logError(error);
    }
  }
};
