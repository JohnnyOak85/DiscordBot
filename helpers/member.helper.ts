// Dependencies
import { GuildMember, PartialGuildMember, User } from 'discord.js';
import { difference } from 'lodash';

// Helpers
import { getUserDoc, readDirectory, saveDoc } from './storage.helper';
import { compareDate, getDate } from './utils.helper';
import { getChannel } from './channels.helper';

/**
 * @description Guarantees the user document has all needed proprieties.
 * @param user
 * @param member
 */
const ensureDoc = (user: UserDoc, member: GuildMember) => {
  if (!user._id) user._id = member.id;
  if (!user.joinedAt) user.joinedAt = member.joinedAt;
  if (!user.nickname) user.nickname = member.nickname;
  if (!user.roles.length) user.roles = member.roles.cache.map((role) => role.id);
  if (!user.username) user.username = member.user.username;

  return user;
};

const validateUsername = (member: GuildMember, user: UserDoc) => {
  try {
    if (!member.manageable || !member.nickname) return;

    user.nickname = member.nickname;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates a user object from a banned user.
 * @param user
 * @param reason
 */
export const buildBannedUser = (user: User, reason: string) => {
  return {
    _id: user.id,
    joinedAt: null,
    nickname: null,
    roles: [],
    strikes: [reason],
    username: user.username
  };
};

/**
 * @description Returns a user document from the database.
 * @param member
 */
export const getUser = async (member: GuildMember) => {
  try {
    const userDoc = await getUserDoc(`${member.guild.id}/${member.user.id}`);

    return ensureDoc(userDoc, member);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Finds a user by the username.
 * @param guildId
 * @param username
 */
export const getUserByUsername = async (guildId: string, username: string) => {
  try {
    const userList = await readDirectory(guildId);

    for await (const user of userList) {
      const userDoc = await getUserDoc(`users/${user}`);

      if (userDoc.username === username) return userDoc;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @description Checks if the member can be moderated.
 * @param moderator
 * @param member
 */
export const checkMember = (moderator: GuildMember, member: GuildMember) => {
  if (!member) return 'You need to mention a valid user.';
  if (moderator.user.id === member.user.id) return 'You cannot moderate yourself!';
  if (!member.manageable) return `You cannot moderate ${member.user.username}.`;
};

/**
 * @description Records an anniversary date for a user.
 * @param member
 * @param date
 */
export const addUserAnniversary = async (member: GuildMember, date: Date) => {
  try {
    const user = await getUser(member);
    user.anniversary = date;

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `The anniversary of ${member.displayName} has been recorded.\n${getDate(date, 'MMMM Do YYYY')}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Checks for changes in the user to be added to the document.
 * @param oldMember
 * @param newMember
 */
export const checkMemberChanges = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
  try {
    const user = await getUser(newMember);
    const newRole = difference(oldMember.roles.cache.array(), newMember.roles.cache.array());

    if (newRole.length) user.roles?.push(newRole[0].id);

    validateUsername(newMember, user);

    saveDoc(`${newMember.guild.id}/${newMember.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

export const registerMember = async (member: GuildMember) => {
  try {
    if (member.user.bot) return;

    const user = await getUser(member);

    validateUsername(member, user);

    if (!member.joinedAt || !user.joinedAt || !compareDate(member.joinedAt, user.joinedAt)) {
      if (!member.guild.systemChannel) return;

      const rulesChannel = await getChannel(member.guild.channels, 'rules', member.guild.systemChannel);

      let message = `Welcome <@${member.user.id}>!`;

      if (rulesChannel) message += ` Please check the ${rulesChannel?.toString()} and have a good time!`;

      member.guild.systemChannel?.send(message);
    }

    for (const role of user.roles) {
      if (await member.guild.roles.fetch(role)) member.roles.add(role);
    }

    if (user.nickname) member.setNickname(user.nickname);

    member.guild.systemChannel?.send(`Rejoice! <@${member.user.id}> is back!`);
  } catch (error) {
    throw error;
  }
};
