// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { banUser } from '../helpers/punishment.helper';

module.exports = {
  name: 'ban',
  description:
    'Mention a user and that user will be banned from the guild. Can be temporary if provided with a number between 1 and 100.',
  usage: '<user> <number of days> <reason>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
        message.channel.send('You do not have permission for this command.');

        return;
      }

      let reason = args.slice(1).join(' ');

      if (!reason) reason = 'No reason provided.';

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          const reply = await banUser(member, reason, args[0]);

          if (!reply) return;

          message.guild?.systemChannel?.send(reply);
        } catch (error) {
          throw error;
        }
      }

      return;
    } catch (error) {
      throw error;
    }
  }
};
