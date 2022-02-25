import { Message } from 'discord.js';
import { readdirSync } from 'fs-extra';

import { PREFIX } from '../config.json';
import { CollectionFactory } from '../factories/collection.factory';

const commands = new CollectionFactory<{
  description: string;
  execute: (message: Message, args?: string[]) => void;
  moderation: boolean;
  name: string;
  usage: string;
}>();

export const setCommands = () => {
  try {
    const commandList = readdirSync(`${__dirname}/../commands`);

    for (const command of commandList) {
      const commandFile = require(`../commands/${command}`);
      commands.addItem(commandFile.name, commandFile);
    }
  } catch (error) {
    throw error;
  }
};

export const executeCommand = (message: Message) => {
  try {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = commands.getItem(args.shift()?.toLowerCase() || '');

    if (!message.content.startsWith(PREFIX) || message.content[1] === PREFIX || message.content.length === 1 || !command) return;

    command.execute(message, args);
  } catch (error) {
    message.channel.send('There was an error trying to execute that command!');
  }
};

export const getCommandsDescription = (verified: boolean) => {
  const reply = ['List of commands:'];

  for (const command of commands.getList()) {
    if (!verified && command.moderation) continue;

    reply.push(` * ${PREFIX}${command.name}`);
  }

  reply.join('\n');
  reply.push(`You can send \`${PREFIX}help [command name]\` to get info on a specific command!`);

  return reply;
};

export const getCommandDescription = (name: string) => {
  const command = commands.getItem(name);

  if (!command) return 'That command does not exist.';

  const reply = [`**Name:** ${command.name}`];
  reply.push(`**Description:** ${command.description}`);
  reply.push(`**Usage:** ${PREFIX}${command.name} ${command.usage}`);

  return reply;
};
