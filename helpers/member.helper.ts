// Dependencies
import { GuildMember, PartialGuildMember, User } from 'discord.js';
import { difference } from 'lodash';

// Helpers
import { getUserDoc, readDirectory, saveDoc } from './storage.helper';
import { compareDate, getDate, hasIllegalWebsite, hasIllegalWord } from './utils.helper';
import { getChannel } from './channels.helper';

import { CENSOR_NICKNAME } from '../config.json';

/**
 * @description Creates a user object from a banned user.
 * @param user
 * @param reason
 */
const buildBannedUser = (user: User, reason: string): UserDoc => {
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
 * @description Guarantees the user document has all needed proprieties.
 * @param user
 * @param member
 */
const ensureDoc = (user: UserDoc, member: GuildMember): UserDoc => {
  if (!user._id) user._id = member.id;
  if (!user.joinedAt) user.joinedAt = member.joinedAt;
  if (!user.nickname) user.nickname = member.nickname;
  if (!user.roles.length) user.roles = member.roles.cache.map((role) => role.id);
  if (!user.username) user.username = member.user.username;

  return user;
};

/**
 * @description Returns a user document from the database.
 * @param member
 */
const getUser = async (member: GuildMember): Promise<UserDoc> => {
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
const getUserByUsername = async (guildId: string, username: string): Promise<UserDoc | undefined> => {
  try {
    const userList = await readDirectory(guildId);

    for await (const user of userList) {
      const userDoc = await getUserDoc(`users/${user}`);

      if ((userDoc.username = username)) return userDoc;
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
const checkMember = (moderator: GuildMember, member: GuildMember): string | void => {
  if (!member) return 'You need to mention a valid user.';
  if (moderator.user.id === member.user.id) return 'You cannot moderate yourself!';
  if (!member.manageable) return `You cannot moderate ${member.user.username}.`;
};

/**
 * @description Records an anniversary date for a user.
 * @param member
 * @param date
 */
const addUserAnniversary = async (member: GuildMember, date: Date): Promise<string> => {
  try {
    const user = await getUser(member);
    user.anniversary = date;

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `The anniversary of ${member.displayName} has been recorded.\n${getDate(date, 'MMMM Do YYYY')}`;
  } catch (error) {
    throw error;
  }
};

const validateUsername = async (member: GuildMember, user: UserDoc): Promise<void> => {
  try {
    if (!member.manageable || !member.nickname) return;

    if ((await hasIllegalWord(member.nickname)) || (await hasIllegalWebsite(member.nickname)))
      await member.setNickname(CENSOR_NICKNAME);

    user.nickname = member.nickname;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Checks for changes in the user to be added to the document.
 * @param oldMember
 * @param newMember
 */
const checkMemberChanges = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> => {
  try {
    const user = await getUser(newMember);
    const newRole = difference(oldMember.roles.cache.array(), newMember.roles.cache.array());

    if (newRole.length) user.roles?.push(newRole[0].id);

    await validateUsername(newMember, user);

    saveDoc(`${newMember.guild.id}/${newMember.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

const registerMember = async (member: GuildMember): Promise<void> => {
  try {
    if (member.user.bot) return;

    const user = await getUser(member);

    await validateUsername(member, user);

    if (!member.joinedAt || !user.joinedAt || !compareDate(member.joinedAt, user.joinedAt)) {
      const rulesChannel = await getChannel(member.guild.channels, 'rules', member.guild.systemChannel);

      let message = `Welcome <@${member.user.id}!`;

      if (rulesChannel)
        message += `Welcome <@${member.user.id}! Please check the ${rulesChannel?.toString()} and have a good time!`;

      member.guild.systemChannel?.send(message);
    }

    for (const role of user.roles) member.roles.add(role);

    if (user.nickname) member.setNickname(user.nickname);

    member.guild.systemChannel?.send(`Rejoice! <@${member.user.id}> is back!`);
  } catch (error) {
    throw error;
  }
};

export { addUserAnniversary, buildBannedUser, checkMember, checkMemberChanges, getUser, getUserByUsername, registerMember };
