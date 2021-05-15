// Discord
import { Message } from 'discord.js';

// Helpers
import { getInvite } from '../helpers/invite.helper';
import { checkMember, getUserByUsername } from '../helpers/member.helper';

module.exports = {
  name: 'unban',
  description: 'Provide a username and that user will have access to the server again.',
  usage: '<username>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
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

          const member = await message.guild?.members.fetch(banned);

          if (member) {
            const warning = checkMember(message.member, member);

            if (warning) {
              message.channel.send(warning);
              return;
            }
          }

          message.guild?.members.unban(banned?.user);
          message.guild?.systemChannel?.send(`${banned.user.username} is no longer banned.`);

          const DMChannel = await banned.user.createDM();
          const invite = getInvite(message.guild, 'general-chat');

          DMChannel.send(`You are no longer banned from ${message.guild?.name}\n${invite}`);
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
