import { Client } from 'discord.js';

import { buildInfoCategory } from './helpers/channels.helper';
import { getArgs, getCommand } from './helpers/command.helper';
import { checkMemberChanges, registerMember } from './helpers/member.helper';
import { illegalMessage } from './helpers/message.helper';
import { buildDatabase, recordItem } from './helpers/storage.helper';
import { logError, logInfo } from './helpers/utils.helper';
import { startTimers } from './helpers/timers.helper';
import { react } from './helpers/reaction.helper';

import { TOKEN } from './config.json';

const bot = new Client();

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
    if (message.channel.type === 'dm' || message.author.bot) return;

    react(message);

    if (await illegalMessage(message)) return;

    const args = getArgs(message.content);
    const command = getCommand(message.content, args.shift()?.toLowerCase() || '');

    if (!command) {
      return;
    }

    command.execute(message, args);
  } catch (error) {
    message.channel.send('There was an error trying to execute that command!');
    logError(error as Error);
  }
});

bot.on('messageUpdate', async (oldMessage, newMessage) => {
  try {
    if (newMessage.partial) return;

    react(newMessage);

    illegalMessage(newMessage);
  } catch (error) {
    logError(error as Error);
  }
});

bot.on('guildMemberAdd', (member) => {
  try {
    registerMember(member);
  } catch (error) {
    logError(error as Error);
  }
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
  try {
    checkMemberChanges(oldMember, newMember);
  } catch (error) {
    logError(error as Error);
  }
});

bot.on('emojiCreate', (emoji) => {
  recordItem(emoji, 'emojis');
});

bot.on('emojiDelete', (emoji) => {
  recordItem(emoji, 'emojis', false);
});

bot.on('emojiUpdate', (emoji) => {
  recordItem(emoji, 'emojis');
});

bot.on('roleCreate', (role) => {
  recordItem(role, 'roles');
});

bot.on('roleDelete', (role) => {
  recordItem(role, 'roles', false);
});

bot.on('roleUpdate', (role) => {
  recordItem(role, 'roles');
});

bot.on('error', (error) => {
  logError(error);
});
