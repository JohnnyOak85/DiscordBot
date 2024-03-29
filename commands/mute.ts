import { Message } from 'discord.js';

import { checkMember } from '../helpers/member.helper';
import { muteUser } from '../helpers/mute.helper';
import { getNumber, getReason, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'mute',
  description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
  usage: '<user> <number of minutes> <reason>',
  moderation: true,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const amount = getNumber(args[1]);
      const reason = getReason(
        args
          .slice(1)
          .join(' ')
          .replace(amount ? args[1] : '', '')
      );

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          const reply = await muteUser(member, reason, amount);

          if (!reply) return;

          message.guild?.systemChannel?.send(reply);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      logError(error);
    }
  }
};
