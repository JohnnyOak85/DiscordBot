import { Message } from 'discord.js';
import { getRandom } from '../helpers/utils.helper';

module.exports = {
  name: 'coin',
  description: 'Toss a coin',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const toss = getRandom(1, 2);

      if (toss === 1) {
        message.reply('Heads!');
      } else {
        message.reply('Tails!');
      }
    } catch (error) {
      throw error;
    }
  }
};
