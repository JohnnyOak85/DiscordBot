// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { unmuteUser } from '../helpers/roles.helper';

module.exports = {
  name: 'unmute',
  description: 'Mention a user and that user will no longer be muted.',
  usage: '<user>',
  moderation: true,
  execute: async (message: Message): Promise<void> => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      for await (const member of message.mentions.members?.array() || []) {
        try {
          const warning = checkMember(message.member, member);

          if (warning) {
            message.channel.send(warning);
            return;
          }

          const reply = await unmuteUser(member);

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
