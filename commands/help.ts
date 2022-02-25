import { Message } from 'discord.js';

import { getCommandDescription, getCommandsDescription } from '../helpers/command.helper';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'help',
  description: 'Displays the list of commands. It can also display information on a given command.',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message, args: string[]) => {
    try {
      args.length
        ? message.channel.send(getCommandDescription(args[0].toLowerCase()))
        : message.channel.send(getCommandsDescription(message.member?.hasPermission('MANAGE_MESSAGES') || false));
    } catch (error) {
      logError(error);
    }
  }
};
