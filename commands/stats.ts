import { Message } from 'discord.js';
import { getStats } from '../helpers/game/player';

import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'stats',
  description: 'Check your game stats',
  usage: ' ',
  moderation: false,
  game: true,
  execute: async (message: Message) => {
    try {
      message.reply(await getStats(message.guild?.id || '', message.author.id));
    } catch (error) {
      logError(error);
    }
  }
};
