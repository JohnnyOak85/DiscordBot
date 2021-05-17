// Dependencies
import { Client } from 'discord.js';

// Helpers
import { buildInfoCategory } from './helpers/channels.helper';
import { getCommands } from './helpers/command.helper';
import { checkMemberChanges, registerMember } from './helpers/member.helper';
import { illegalMessage } from './helpers/message.helper';
import { buildDatabase } from './helpers/storage.helper';
import { logError, logInfo, startTimers } from './helpers/utils.helper';

// Configurations
import { PREFIX, TOKEN } from './config.json';
import { getReaction } from './helpers/reaction.helper';

const bot = new Client();
const commands = getCommands();

bot.login(TOKEN);

bot.on('ready', () => {
  logInfo(`The bot went online.`);

  for (const guild of bot.guilds.cache.array()) {
    buildDatabase(guild);
    buildInfoCategory(guild);
    startTimers(guild);
  }

  console.log('Ready.');
});

bot.on('message', async (message) => {
  try {
    const reaction = getReaction(message.content.toLowerCase());

    if (reaction) message.react(reaction);

    if (message.channel.type === 'dm') return;

    if (await illegalMessage(message)) return;

    if (!message.content.startsWith(PREFIX) || message.content[1] === PREFIX || message.content.length === 1) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = commands.get(args.shift()?.toLowerCase() || '');

    if (!command) {
      message.channel.send('Invalid command.');
      return;
    }

    await command.execute(message, args);
  } catch (error) {
    message.channel.send('There was an error trying to execute that command!');
    logError(error);
  }
});

bot.on('messageUpdate', async (oldMessage, newMessage) => {
  try {
    if (newMessage.partial) return;

    illegalMessage(newMessage);
  } catch (error) {
    logError(error);
  }
});

bot.on('guildMemberAdd', (member) => {
  try {
    registerMember(member);
  } catch (error) {
    logError(error);
  }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
  try {
    checkMemberChanges(oldMember, newMember);
    return;
  } catch (error) {
    logError(error);
  }
});

bot.on('error', (error) => logError(error));
