import { Guild, GuildMember, User } from 'discord.js';

import { checkRepeats, compareDate, getBool, getDate, increment, logError } from './tools/utils.helper';
import { docExists, findDoc, getDoc, saveDoc } from './tools/database.helper';
import { StoryFactory } from '../factories/story.factory';
import { buildEmbed } from './tools/embed.helper';
import { bulkAddRoles, upgradeRole } from './roles.helper';

interface UserDoc {
  _id?: string;
  anniversary?: Date;
  attack?: number;
  bestiary?: string[];
  defense?: number;
  joinedAt?: Date | null;
  health?: number;
  level?: number;
  losses?: number;
  luck?: number;
  messages?: number;
  nickname?: string | null;
  removed?: boolean;
  roles?: string[];
  strikes?: string[];
  timer?: string;
  username?: string;
  wins?: number;
}

const getStory = (nickname: string) => new StoryFactory(nickname).getStory();

export const recordBannedUser = (user: User, reason: string, guild: string) =>
  docExists(guild, user.id).then((bool) => (bool ? saveDoc(buildBannedUser(user, reason), guild, user.id) : null));

export const getUser = (member: GuildMember) =>
  getDoc<UserDoc>(member.guild.id, member.user.id).then((doc) => ensureUser(doc, member));

export const findUser = (guild: string, user: string) => findDoc<UserDoc>(guild, user);
export const saveUser = (member: GuildMember, doc: UserDoc) => saveDoc(doc, member.guild.id, member.user.id);

export const getUserByUsername = (guildId: string, username: string) => findDoc<UserDoc>(guildId, username);

export const ensureUser = (user: UserDoc, member: GuildMember) => {
  user._id = user._id || member.id;
  user.joinedAt = user.joinedAt || member.joinedAt;
  user.nickname = user.nickname || member.nickname;
  user.roles = user.roles?.length ? user.roles : member.roles.cache.map((role) => role.id);
  user.username = user.username || member.user.username;

  return user;
};

export const incrementMessages = async (guild: Guild, user: string, wonRaffle: boolean) => {
  const doc = await getDoc<UserDoc>(guild.id, user);
  const currentLevel = doc.level || 1;

  if (!doc.roles?.includes('') || currentLevel >= 50) return; // TODO Add game role id

  let description = `<@${doc._id}>\n**${currentLevel} -> ${doc.level}**`;

  doc.messages = (doc.messages || 1) + 1;
  doc.level = doc.level || 1;
  doc.level = increment(doc.messages, doc.level || 1);

  const upgrade = await upgradeRole(guild.members.cache.array(), user, doc.level);

  if (wonRaffle) {
    doc.luck = (doc.luck || 1) + 1;

    guild.systemChannel?.send(buildEmbed({ description: 'You just won the daily raffle! **+1 luck.**', title: 'LUCKY!' }));
  }

  if (doc.messages.toString().length > 2 && checkRepeats(doc.messages.toString()) && getBool()) {
    doc.luck = (doc.luck || 1) + 1;
    description = `${description}\n**+1 luck.**`;
  }

  if (upgrade) {
    description = `${description}\n**Rank up! -> ${upgrade}!**`;
  }

  if (doc.level > currentLevel) {
    const embed = buildEmbed({ description, title: 'Level up!' });

    guild.systemChannel?.send(embed);
  }

  saveDoc(doc, guild.id, user);
};

export const buildBannedUser = (user: User, reason: string) => {
  return {
    _id: user.id,
    joinedAt: null,
    nickname: null,
    removed: true,
    roles: [],
    strikes: [reason],
    username: user.username
  };
};

export const checkMember = (moderator: GuildMember, member: GuildMember) => {
  if (!member) {
    return 'You need to mention a valid user.';
  }

  if (moderator.user.id === member.user.id) {
    return 'You cannot moderate yourself!';
  }

  if (!member.manageable) {
    return `You cannot moderate ${member.user.username}.`;
  }
};

export const addUserAnniversary = async (member: GuildMember, date: Date) => {
  try {
    const user = await getUser(member);
    user.anniversary = date;

    saveDoc(user, member.guild.id, member.user.id);

    return `The anniversary of ${member.displayName} has been recorded.\n${getDate(date, 'MMMM Do YYYY')}`;
  } catch (error) {
    throw error;
  }
};

export const checkMemberChanges = async (member: GuildMember) => {
  try {
    const user = await getUser(member);

    user.roles = [];

    for (const role of member.roles.cache.array()) {
      user.roles?.push(role.id);
    }

    user.nickname = member.manageable && member.nickname ? member.nickname : '';

    saveDoc(user, member.guild.id, member.user.id);
  } catch (error) {
    logError(error);
  }
};

export const registerMember = async (member: GuildMember) => {
  try {
    if (member.user.bot) return;

    let user;

    try {
      user = await getUser(member);
    } catch (error) {
      user = {
        _id: member.id,
        nickname: member.nickname,
        roles: member.roles.cache.map((role) => role.id),
        username: member.user.username
      };
    }

    let reply = '';

    user.nickname = member.manageable && member.nickname ? member.nickname : '';

    if (!user.joinedAt) {
      user.joinedAt = member.joinedAt;

      reply = `Welcome <@${member.user.id}>! Have a story:\n${await getStory(member.nickname || member.displayName)}`;
    } else {
      bulkAddRoles(member, member.guild.roles.cache.array(), user.roles || []);

      if (user.nickname) {
        member.setNickname(user.nickname);
      }

      user.removed = false;

      reply = `Rejoice! <@${member.user.id}> is back!`;
    }

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(reply);
  } catch (error) {
    logError(error);
  }
};

export const removeUser = async (member: GuildMember | undefined) => {
  try {
    if (!member || member.user.bot) return;

    const user = await getUser(member);

    user.removed = true;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(`<@${member.user.id}> has left the building!`);
  } catch (error) {
    logError(error);
  }
};
