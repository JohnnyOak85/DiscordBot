import { Message } from 'discord.js';

import { getBool, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'coin',
  description: 'Toss a coin',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      getBool() ? message.reply('Heads!') : message.reply('Tails!');
    } catch (error) {
      logError(error);
    }
  }
};
