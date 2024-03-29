import { Message } from 'discord.js';

import { acceptChallenge } from '../helpers/game/arena.helper';
import { logError } from '../helpers/tools/utils.helper';

import { arena, NAME } from '../game-config.json';

module.exports = {
  name: 'accept',
  description: `Accept a challenge another user issued. Only works in ${NAME}`,
  usage: ' ',
  moderation: false,
  game: true,
  execute: async (message: Message) => {
    try {
      if (message.channel.type !== 'text' || message.channel.name !== arena) return;

      acceptChallenge(message.channel, message.author.id);
    } catch (error) {
      logError(error);
    }
  }
};
