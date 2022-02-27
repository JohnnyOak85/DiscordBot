import { Message } from 'discord.js';

import { getCommandDescription, getCommandsDescription } from '../helpers/command.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'help',
  description: 'Displays the list of commands. It can also display information on a given command.',
  usage: '<command>',
  moderation: false,
  game: false,
  execute: async (message: Message, args: string[]) => {
    try {
      const isVerified = message.member?.hasPermission('MANAGE_MESSAGES') || false;
      const isGame = !!message.member?.roles.cache.get(''); // TODO Add game role id

      args.length
        ? message.channel.send(getCommandDescription(args[0].toLowerCase(), isVerified, isGame))
        : message.channel.send(getCommandsDescription(isVerified, isGame));
    } catch (error) {
      logError(error);
    }
  }
};
