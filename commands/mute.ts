// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { muteUser } from '../helpers/roles.helper';

module.exports = {
  name: 'mute',
  description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
  usage: '<user> <number of minutes> <reason>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const amount = parseInt(args[0]);
      let reason = args.slice(1).join(' ');

      if (!reason) reason = 'No reason provided.';

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          const reply = await muteUser(member, reason, amount.toString());

          if (!reply) return;

          message.guild?.systemChannel?.send(reply);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }
};
