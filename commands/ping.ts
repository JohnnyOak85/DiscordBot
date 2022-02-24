import { Message } from 'discord.js';

import { logError } from '../helpers/utils.helper';

module.exports = {
  name: 'ping',
  description: 'Check if the bot is on',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message) => {
    try {
      message.reply('Pong!');
    } catch (error) {
      logError(error);
    }
  }
};
