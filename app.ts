import { Client } from 'discord.js';

import { checkMemberChanges, recordBannedUser, registerMember, removeUser } from './helpers/member.helper';
import { checkIncomingMessage, checkMessageUpdate } from './helpers/message.helper';
import { collectData, recordItem, recordQuote } from './helpers/data.helper';
import { logError } from './helpers/tools/utils.helper';
import { unbanUser } from './helpers/punishment.helper';

import { TOKEN } from './config.json';

const bot = new Client();

bot.login(TOKEN);

bot.on('ready', () => collectData(bot.guilds.cache.array()));

bot.on('message', async (message) => checkIncomingMessage(message));
bot.on('messageUpdate', async (oldMessage, message) => checkMessageUpdate(message.partial ? undefined : message));
bot.on('messageReactionAdd', (reaction) => recordQuote(reaction.message, reaction.emoji.name, reaction.count || 0));

bot.on('guildMemberAdd', (member) => registerMember(member));
bot.on('guildMemberRemove', (member) => removeUser(member.partial ? undefined : member));
bot.on('guildMemberUpdate', (oldMember, member) => checkMemberChanges(member, oldMember.roles.cache.array()));

bot.on('emojiCreate', (emoji) => recordItem(emoji, 'emojis'));
bot.on('emojiDelete', (emoji) => recordItem(emoji, 'emojis', false));
bot.on('emojiUpdate', (emoji) => recordItem(emoji, 'emojis'));

bot.on('roleCreate', (role) => recordItem(role, 'roles'));
bot.on('roleDelete', (role) => recordItem(role, 'roles', false));
bot.on('roleUpdate', (role) => recordItem(role, 'roles'));

bot.on('guildBanAdd', (guild, user) => recordBannedUser(user, '', guild.id));
bot.on('guildBanRemove', (guild, user) => unbanUser(guild, user));

bot.on('error', (error) => logError(error));
