// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { kickUser } from '../helpers/punishment.helper';

module.exports = {
  name: 'kick',
  description: 'Mention a user and that user gets removed from the guild.',
  usage: '<user> <reason>',
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

          const reply = await kickUser(member, reason);

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
