import { Client } from 'discord.js';

import { executeCommand } from './helpers/command.helper';
import { checkMemberChanges, registerMember } from './helpers/member.helper';
import { illegalMessage } from './helpers/message.helper';
import { recordData, recordItem } from './helpers/data.helper';
import { logError, logInfo } from './helpers/utils.helper';
import { startTimers } from './helpers/timers.helper';
import { setRolesChannel } from './helpers/roles.helper';
import { react } from './helpers/reaction.helper';

import { TOKEN } from './config.json';

const bot = new Client();

bot.login(TOKEN);

bot.on('ready', () => {
  logInfo(`The bot went online.`);

  for (const guild of bot.guilds.cache.array()) {
    recordData(guild);
    setRolesChannel(guild.channels.cache.array());
    startTimers(guild);
  }

  console.log('Ready.');
});

bot.on('message', async (message) => {
  try {
    if (message.channel.type === 'dm' || message.author.bot) return;

    react(message);

    if (await illegalMessage(message)) return;

    executeCommand(message);
  } catch (error) {
    message.channel.send('There was an error trying to execute that command!');
    logError(error as Error);
  }
});

bot.on('messageUpdate', async (oldMessage, message) => {
  try {
    if (message.partial || message.channel.type === 'dm' || message.author.bot) return;

    react(message);

    illegalMessage(message);
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
