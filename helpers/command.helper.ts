// Dependencies
import { Collection } from 'discord.js';
import { readdirSync } from 'fs-extra';

const commands = new Collection<string, Command>();

/**
 * @description Returns the command list.
 */
const getCommands = (): Collection<string, Command> => {
  try {
    if (!commands.array().length) setCommands();

    return commands;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Builds the command list.
 */
const setCommands = (): void => {
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

export { getCommands };
