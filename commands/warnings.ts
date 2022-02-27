import { Message } from 'discord.js';

import { checkMember } from '../helpers/member.helper';
import { listWarnings, getUserWarnings } from '../helpers/punishment.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'warnings',
  description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
  usage: '<user>',
  moderation: true,
  game: false,
  execute: async (message: Message) => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      if (!message.mentions.members?.array().length) {
        message.channel.send(await listWarnings(message.guild?.id || ''));
        return;
      }

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          message.channel.send(await getUserWarnings(member));
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      logError(error);
    }
  }
};
