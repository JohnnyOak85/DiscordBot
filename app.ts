import { Client } from 'discord.js';

import { checkMemberChanges, registerMember } from './helpers/member.helper';
import { checkIncomingMessage, checkMessageUpdate } from './helpers/message.helper';
import { collectData, recordItem } from './helpers/data.helper';
import { logError } from './helpers/utils.helper';

import { TOKEN } from './config.json';

const bot = new Client();

bot.login(TOKEN);

bot.on('ready', () => collectData(bot.guilds.cache.array()));

bot.on('message', async (message) => checkIncomingMessage(message));
bot.on('messageUpdate', async (oldMessage, message) => checkMessageUpdate(message.partial ? undefined : message));

bot.on('guildMemberAdd', (member) => registerMember(member));
bot.on('guildMemberUpdate', (oldMember, newMember) => checkMemberChanges(oldMember, newMember));

bot.on('emojiCreate', (emoji) => recordItem(emoji, 'emojis'));
bot.on('emojiDelete', (emoji) => recordItem(emoji, 'emojis', false));
bot.on('emojiUpdate', (emoji) => recordItem(emoji, 'emojis'));

bot.on('roleCreate', (role) => recordItem(role, 'roles'));
bot.on('roleDelete', (role) => recordItem(role, 'roles', false));
bot.on('roleUpdate', (role) => recordItem(role, 'roles'));

bot.on('error', (error) => logError(error));
