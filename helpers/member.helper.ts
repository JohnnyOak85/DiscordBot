import { Guild, GuildMember, Role, User } from 'discord.js';
import { difference } from 'lodash';

import { compareDate, getDate, increment, logError } from './tools/utils.helper';
import { docExists, findDoc, getDoc, saveDoc } from './tools/database.helper';
import { StoryFactory } from '../factories/story.factory';
import { buildEmbed } from './tools/embed.helper';

interface UserDoc {
  _id?: string;
  anniversary?: Date;
  attack?: number;
  defense?: number;
  joinedAt?: Date | null;
  health?: number;
  level?: number;
  luck?: number;
  messages?: number;
  nickname?: string | null;
  removed?: boolean;
  roles?: string[];
  strikes?: string[];
  timer?: string;
  username?: string;
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

export const incrementMessages = async (guild: Guild, user: string) => {
  const doc = await getDoc<UserDoc>(guild.id, user);

  if (!doc.roles?.includes('')) return;

  const currentLevel = doc.level || 1;

  doc.messages = (doc.messages || 1) + 1;
  doc.level = doc.level || 1;
  doc.level = increment(doc.messages, doc.level || 1);

  if (doc.level > currentLevel) {
    const embed = buildEmbed({ description: `<@${doc._id}>\n${currentLevel} -> ${doc.level}`, title: 'Level up!' });

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

export const checkMemberChanges = async (member: GuildMember, oldRoles: Role[]) => {
  try {
    const user = await getUser(member);
    const newRole = difference(oldRoles, member.roles.cache.array());

    if (newRole.length) {
      user.roles?.push(newRole[0].id);
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

    const user = await getUser(member);

    user.nickname = member.manageable && member.nickname ? member.nickname : '';

    if (!member.joinedAt || !user.joinedAt || !compareDate(member.joinedAt, user.joinedAt)) {
      member.guild.systemChannel?.send(
        `Welcome <@${member.user.id}>! Have a story:\n${await getStory(member.nickname || member.displayName)}`
      );

      saveDoc(user, member.guild.id, member.user.id);
      return;
    }

    user.roles = user.roles || [];

    for (const role of user.roles) {
      if (await member.guild.roles.fetch(role)) {
        member.roles.add(role);
      }
    }

    if (user.nickname) {
      member.setNickname(user.nickname);
    }

    user.removed = false;

    saveDoc(user, member.guild.id, member.user.id);

    member.guild.systemChannel?.send(`Rejoice! <@${member.user.id}> is back!`);
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
