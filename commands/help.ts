import { Message } from 'discord.js';

import { getCommand, getCommands } from '../helpers/command.helper';

import { PREFIX } from '../config.json';
import { logError } from '../helpers/utils.helper';

module.exports = {
  name: 'help',
  description: 'Displays the list of commands. It can also display information on a given command.',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message, args: string[]) => {
    try {
      const commands = getCommands();
      const isVerified = message.member?.hasPermission('MANAGE_MESSAGES');
      const reply: string[] = [];

      if (!args.length) {
        reply.push('List of commands:');

        for (const command of commands) {
          if (!isVerified && command.moderation) continue;

          reply.push(` * ${PREFIX}${command.name}`);
        }

        reply.join('\n');
        reply.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

        await message.channel.send(reply);

        return;
      }

      const taggedCommand = getCommand(args[0].toLowerCase());

      if (!taggedCommand) {
        message.channel.send('That command does not exist.');
        return;
      }

      reply.push(`**Name:** ${taggedCommand.name}`);
      reply.push(`**Description:** ${taggedCommand.description}`);
      reply.push(`**Usage:** ${PREFIX}${taggedCommand.name} ${taggedCommand.usage}`);

      message.channel.send(reply);

      return;
    } catch (error) {
      logError(error);
    }
  }
};
