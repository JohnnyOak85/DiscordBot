// Discord
import { Message } from 'discord.js';

// Helpers
import { getInvite } from '../helpers/invite.helper';

module.exports = {
  name: 'invite',
  description: 'Returns a permanent invite for a given channel, or one for general.',
  usage: '<channel name>',
  moderation: false,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      const invite = await getInvite(message.guild, args[0]);

      message.reply(invite ? `Here's the invite:\n${invite}` : `I couldn't get your invite!`);
    } catch (error) {
      throw error;
    }
  }
};
