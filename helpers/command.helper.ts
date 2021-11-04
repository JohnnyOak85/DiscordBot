// Dependencies
import { Collection, Message } from 'discord.js';
import { readdirSync } from 'fs-extra';

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

/**
 * @description Returns the command list.
 */
export const getCommands = () => {
  try {
    if (!commands.array().length) setCommands();

    return commands;
  } catch (error) {
    throw error;
  }
};
