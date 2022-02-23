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

const setCommands = () => {
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

export const getCommands = () => {
  try {
    if (!commands.isSet()) {
      setCommands();
    }

    return commands.getList();
  } catch (error) {
    throw error;
  }
};

export const getCommand = (name: string) => {
  if (!commands.isSet()) {
    setCommands();
  }

  return commands.getItem(name);
};

export const executeCommand = (message: Message) => {
  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = getCommand(args.shift()?.toLowerCase() || '');

  if (!message.content.startsWith(PREFIX) || message.content[1] === PREFIX || message.content.length === 1 || !command) return;

  command.execute(message, args);
};
