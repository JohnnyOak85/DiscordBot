import { Message } from 'discord.js';

import { resetPlayer } from '../helpers/game/player';
import { logError } from '../helpers/tools/utils.helper';

import { NAME } from '../game-config.json';

module.exports = {
  name: 'reset',
  description: `Reset a player's stats! Only works in ${NAME}`,
  usage: '<user>',
  moderation: true,
  game: true,
  execute: async (message: Message) => {
    try {
      if (!message.mentions.users.array().length) return;

      resetPlayer(message.guild?.id || '', message.mentions.users.array()[0].id);

      message.reply(`<@${message.mentions.users.array()[0].id}>'s stats have been reset!`);
    } catch (error) {
      logError(error);
    }
  }
};
