// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { listWarnings, getUserWarnings } from '../helpers/punishment.helper';

module.exports = {
  name: 'warnings',
  description: "Lists all users with strikes. If provided with a user, it will list that user's strikes",
  usage: '<user>',
  moderation: true,
  execute: async (message: Message): Promise<void> => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      if (!message.mentions.members?.array().length) {
        const reply = await listWarnings(message.guild?.id || '');

        message.channel.send(reply);
        return;
      }

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          const reply = await getUserWarnings(member);

          message.channel.send(reply);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }
};
