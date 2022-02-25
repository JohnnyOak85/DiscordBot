import { Message } from 'discord.js';

import { getDoc } from '../helpers/tools/database.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'rules',
  description: 'List all rules.',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      message.guild?.systemChannel?.send((await getDoc<string[]>('configurations', 'rules')).join('\n'));
    } catch (error) {
      logError(error);
    }
  }
};
