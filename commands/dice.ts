import { Message } from 'discord.js';

import { getRandom, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'dice',
  description: 'Roll a dice',
  usage: ' ',
  moderation: false,
  game: false,
  execute: async (message: Message) => {
    try {
      message.reply(`Rolled a ${getRandom(6)}!`);
    } catch (error) {
      logError(error);
    }
  }
};
