import { Message } from 'discord.js';

import { getQuote } from '../helpers/reaction.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'quote',
  description: 'Generate a random quote',
  usage: ' ',
  moderation: false,
  game: false,
  execute: async (message: Message) => {
    try {
      message.channel.send(await getQuote());
    } catch (error) {
      logError(error);
    }
  }
};
