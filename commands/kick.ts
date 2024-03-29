import { Message } from 'discord.js';

import { checkMember } from '../helpers/member.helper';
import { kickUser } from '../helpers/punishment.helper';
import { getReason, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'kick',
  description: 'Mention a user and that user gets removed from the guild.',
  usage: '<user> <reason>',
  moderation: true,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
        message.channel.send('You do not have permission for this command.');

        return;
      }

      const reason = getReason(args.slice(1).join(' '));

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
      logError(error);
    }
  }
};
