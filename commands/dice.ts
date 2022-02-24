import { Message } from 'discord.js';

import { getRandom, logError } from '../helpers/utils.helper';

module.exports = {
  name: 'dice',
  description: 'Roll a dice',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const roll = getRandom(6);

      message.reply(`Rolled a ${roll}!`);
    } catch (error) {
      logError(error);
    }
  }
};
