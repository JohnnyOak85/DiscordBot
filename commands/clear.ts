// Discord
import { Message } from 'discord.js';

module.exports = {
  name: 'clear',
  description: 'Clear a set amount of lines from 1 to 100.',
  usage: '<number of lines>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const amount = parseInt(args[0]);

      if (amount < 0 || amount > 100 || isNaN(amount)) {
        message.channel.send('I need a number from 1 to 100.');
        return;
      }

      message.channel.messages.channel.bulkDelete(amount + 1, true);
    } catch (error) {
      throw error;
    }
  }
};
