import { Message } from 'discord.js';

import { getUserByUsername } from '../helpers/member.helper';
import { unbanUser } from '../helpers/punishment.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'unban',
  description: 'Provide a username and that user will have access to the server again.',
  usage: '<username>',
  moderation: true,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const bannedList = await message.guild?.fetchBans();

      if (!bannedList?.array().length) {
        message.channel.send('I have no record of any banned users.');
        return;
      }

      for await (const username of args) {
        try {
          const user = await getUserByUsername(message.guild?.id || '', username);

          if (!user) {
            message.channel.send(`I have no record of ${username}.`);
            return;
          }

          const banned = bannedList.get(user._id || '');

          if (!banned) {
            message.channel.send(`${username} isn't banned.`);
            return;
          }

          if (!message.guild) return;

          unbanUser(message.guild, banned.user);
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
