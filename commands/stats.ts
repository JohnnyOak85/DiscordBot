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
      const stats = await getStats(message.guild?.id || '', message.author.id);

      message.reply(stats);
    } catch (error) {
      logError(error);
    }
  }
};
