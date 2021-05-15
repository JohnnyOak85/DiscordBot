// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { forgiveUser } from '../helpers/punishment.helper';

module.exports = {
  name: 'forgive',
  description: 'Mention a user and that user will get a strike removed.',
  usage: '<user>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
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

          const reply = await forgiveUser(member, args.slice(1).join(' '));

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
