// Discord
import { Message } from 'discord.js';

// Helpers
import { checkMember } from '../helpers/member.helper';
import { warnUser } from '../helpers/punishment.helper';

// Configurations
import { MAX_STRIKES } from '../config.json';

module.exports = {
  name: 'warn',
  description: `Mention a user and give it a warning. User will be muted after ${
    MAX_STRIKES / 2
  } warnings and banned after ${MAX_STRIKES}.`,
  usage: '<user> <reason>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      if (!message.member?.hasPermission('MANAGE_MESSAGES')) {
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

          const reply = await warnUser(member, reason);

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
