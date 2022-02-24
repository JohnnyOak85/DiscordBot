import { Message } from 'discord.js';

import { getRandomQuote } from '../helpers/reaction.helper';
import { logError } from '../helpers/utils.helper';

module.exports = {
  name: 'quote',
  description: 'Generate a random quote',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const quote = await getRandomQuote();

      message.channel.send(quote);
    } catch (error) {
      logError(error);
    }
  }
};
