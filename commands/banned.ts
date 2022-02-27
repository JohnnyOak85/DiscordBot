import { Message } from 'discord.js';

import { getReason, logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'banned',
  description: 'Lists all the users that have been banned.',
  usage: ' ',
  moderation: true,
  game: false,
  execute: async (message: Message) => {
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
        reply = `${reply}${bannedUser.user.username}: ${getReason(bannedUser.reason)}\n`;
      }

      message.channel.send(reply);
      return;
    } catch (error) {
      logError(error);
    }
  }
};
