import { Message } from 'discord.js';

import { getDoc } from '../helpers/database.helper';
import { logError } from '../helpers/utils.helper';

module.exports = {
  name: 'rules',
  description: 'List all rules.',
  usage: ' ',
  moderation: false,
  execute: async (message: Message, args: string[]) => {
    try {
      const rules = await getDoc<string[]>('configurations', 'rules');

      message.guild?.systemChannel?.send(rules.join('\n'));
    } catch (error) {
      logError(error);
    }
  }
};
