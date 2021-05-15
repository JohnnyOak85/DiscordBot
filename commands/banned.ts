// Discord
import { Message } from 'discord.js';

module.exports = {
  name: 'banned',
  description: 'Lists all the users that have been banned.',
  usage: ' ',
  moderation: true,
  execute: async (message: Message): Promise<void> => {
    try {
      if (!message.member?.hasPermission('BAN_MEMBERS')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const bannedList = await message.guild?.fetchBans();
      let reply = '';

      if (!bannedList?.array().length) {
        message.channel.send('I have no record of any banned users.');
        return;
      }

      for await (const bannedUser of bannedList.array()) {
        if (!bannedUser.reason) bannedUser.reason = 'No reason provided';

        reply = `${reply}${bannedUser.user.username}: ${bannedUser.reason}\n`;
      }

      message.channel.send(reply);
      return;
    } catch (error) {
      throw error;
    }
  }
};
