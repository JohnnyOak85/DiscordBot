import { Collection, Message } from 'discord.js';
import { readdirSync } from 'fs-extra';

import { PREFIX } from '../config.json';

interface Command {
  description: string;
  execute: (message: Message, args?: string[]) => void;
  moderation: boolean;
  name: string;
  usage: string;
}

const commands = new Collection<string, Command>();

/**
 * @description Builds the command list.
 */
const setCommands = () => {
  try {
    const commandList = readdirSync(`${__dirname}/../commands`);

    for (const command of commandList) {
      const commandFile = require(`../commands/${command}`);
      commands.set(commandFile.name, commandFile);
    }
  } catch (error) {
    throw error;
  }
};

export const getCommands = () => {
  try {
    if (!commands.array().length) {
      setCommands();
    }

    return commands;
  } catch (error) {
    throw error;
  }
};

export const getArgs = (message: string) => message.slice(PREFIX.length).trim().split(/ +/g);

export const getCommand = (message: string, name: string) => {
  try {
    if (!commands.array().length) {
      setCommands();
    }

    if (!message.startsWith(PREFIX) || message[1] === PREFIX || message.length === 1) return;

    return commands.get(name);
  } catch (error) {
    throw error;
  }
};
