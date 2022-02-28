import { Message } from 'discord.js';

import { issueChallenge } from '../helpers/game/arena.helper';
import { logError } from '../helpers/tools/utils.helper';

import { arena, NAME } from '../game-config.json';

module.exports = {
  name: 'challenge',
  description: `Challenge another user to combat! Only works in ${NAME}`,
  usage: '<user>',
  moderation: false,
  game: true,
  execute: async (message: Message) => {
    try {
      const mentions = message.mentions.members?.array();

      if (!mentions?.length || message.channel.type !== 'text' || message.channel.name !== arena) return;

      if (message.author.id === mentions[0].id) {
        message.reply('this is not the way to challenge yourself.');
        return;
      }

      if (mentions[0].user.bot) {
        message.reply('do not challenge a bot, you will lose.');
        return;
      }

      issueChallenge(message.channel, message.author.id, mentions[0].id);
    } catch (error) {
      logError(error);
    }
  }
};
