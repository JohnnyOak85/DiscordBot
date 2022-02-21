import { Message } from 'discord.js';

import { getBool } from '../helpers/utils.helper';

module.exports = {
  name: 'coin',
  description: 'Toss a coin',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const toss = getBool();

      if (toss) {
        message.reply('Heads!');
      } else {
        message.reply('Tails!');
      }
    } catch (error) {
      throw error;
    }
  }
};
