import { Message } from 'discord.js';

import { getNumber, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'clear',
  description: 'Clear a set amount of lines from 1 to 99.',
  usage: '<number of lines>',
  moderation: true,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const amount = getNumber(args[0]);

      if (!amount) {
        message.channel.send('I need a number from 1 to 99.');
        return;
      }

      message.channel.messages.channel.bulkDelete(amount + 1, true);
    } catch (error) {
      logError(error);
    }
  }
};
