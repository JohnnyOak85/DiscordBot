import { Client } from 'discord.js';

import { buildInfoCategory } from './helpers/channels.helper';
import { getCommands } from './helpers/command.helper';
import { checkMemberChanges, registerMember } from './helpers/member.helper';
import { illegalMessage } from './helpers/message.helper';
import { buildDatabase } from './helpers/storage.helper';
import { logError, logInfo, startTimers } from './helpers/utils.helper';
import { getReply } from './helpers/reaction.helper';

import { PREFIX, TOKEN } from './config.json';

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
    if (message.channel.type === 'dm') return;

    const reply = await getReply(message.content.toLowerCase(), 'replies');
    const reaction = await getReply(message.content.toLowerCase(), 'reactions');

    if (reply) message.channel.send(reply);
    if (reaction) message.react(reaction);

    if (await illegalMessage(message)) return;

    if (!message.content.startsWith(PREFIX) || message.content[1] === PREFIX || message.content.length === 1) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = commands.get(args.shift()?.toLowerCase() || '');

    if (!command) {
      message.channel.send('Invalid command.');
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
    return;
  } catch (error) {
    logError(error as Error);
  }
});

bot.on('error', (error) => {
  logError(error);
});
