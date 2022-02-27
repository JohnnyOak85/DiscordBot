import { Message } from 'discord.js';

import { getInvite } from '../helpers/invite.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'invite',
  description: 'Returns a permanent invite for a given channel, or one for general.',
  usage: '<channel name>',
  moderation: false,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      if (!message.guild) return;

      const invite = await getInvite((await message.guild.fetchInvites()).array(), message.guild.channels, args[0]);

      message.reply(invite ? `Here's the invite:\n${invite}` : `I couldn't get your invite!`);
    } catch (error) {
      logError(error);
    }
  }
};
