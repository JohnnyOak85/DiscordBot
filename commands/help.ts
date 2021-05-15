// Discord
import { Message } from 'discord.js';

// Helpers
import { getCommands } from '../helpers/command.helper';

// Configurations
import { PREFIX } from '../config.json';

module.exports = {
  name: 'help',
  description: 'Displays the list of commands. It can also display information on a given command.',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      const commands = getCommands();
      const isVerified = message.member?.hasPermission('MANAGE_MESSAGES');
      const reply: string[] = [];

      if (!args.length) {
        reply.push('List of commands:');

        for (const command of commands.array()) {
          if (!isVerified && command.moderation) return;

          reply.push(` * ${PREFIX}${command.name}`);
        }

        reply.join('\n');
        reply.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

        await message.channel.send(reply);
        return;
      }

      const command = commands.get(args[0].toLowerCase());

      if (!command) {
        message.channel.send('That command does not exist.');
        return;
      }

      reply.push(`**Name:** ${command.name}`);
      reply.push(`**Description:** ${command.description}`);
      reply.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

      message.channel.send(reply);

      return;
    } catch (error) {
      throw error;
    }
  }
};
