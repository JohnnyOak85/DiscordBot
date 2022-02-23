import { GuildMember } from 'discord.js';

import { findUser, getUser, saveUser } from './member.helper';

import { MAX_STRIKES } from '../config.json';
import { listDocs } from './database.helper';
import { muteUser } from './mute.helper';

export const kickUser = async (member: GuildMember, reason: string) => {
  try {
    const user = await getUser(member);

    member.kick(reason);

    user.strikes = user.strikes || [];

    if (!user.strikes.includes(reason)) {
      user.strikes.push(reason);
    }

    saveUser(member, user);

    return `${member.displayName} has been kicked.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

export const banUser = async (member: GuildMember, reason: string, days?: number) => {
  try {
    const user = await getUser(member);
    const DMChannel = await member.createDM();

    member.ban({ days, reason });

    if (days) {
      reason = `${reason} for ${days} days.`;
    }

    user.strikes = user.strikes || [];

    if (!user.strikes.includes(reason)) {
      user.strikes.push(reason);
    }

    user.roles = [];

    saveUser(member, user);

    DMChannel.send(`You have been banned from ${member.guild.name}.\n${reason}`);

    return `${member.displayName} has been banned.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Adds a warning to the user's warning list.
 */
export const warnUser = async (member: GuildMember, reason: string) => {
  try {
    const user = await getUser(member);

    user.strikes = user.strikes || [];

    if (!user.strikes.includes(reason)) {
      user.strikes.push(reason);
    }

    if (user.strikes.length === MAX_STRIKES) {
      return await banUser(member, `Warned ${MAX_STRIKES} times, out!`);
    }

    if (user.strikes.length && user.strikes.length >= MAX_STRIKES / 2) {
      return (await muteUser(member, `Warned ${MAX_STRIKES / 2} times, better watch it!`)) || '';
    }

    saveUser(member, user);

    return `${member.displayName} has been warned.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Removes one or more warnings from the user's warning list.
 */
export const forgiveUser = async (member: GuildMember, amount: string) => {
  try {
    const user = await getUser(member);
    const amountNumber = parseInt(amount, 10);
    user.strikes = user.strikes || [];

    if (!user.strikes.length) {
      return `${member.user.username} has no strikes.`;
    }

    if (!amountNumber || amountNumber < 1 || (amountNumber >= MAX_STRIKES && isNaN(amountNumber))) {
      user.strikes.shift();
      return `A warning has been removed from ${member.user.username}.`;
    }

    for (let i = 0; i < amountNumber; i++) {
      user.strikes.shift();
      return `${amountNumber} warnings have been removed from ${member.user.username}`;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns the list of users with warnings.
 */
export const listWarnings = async (guildId: string) => {
  try {
    const userList = await listDocs(guildId);
    const warningsList = [];

    for await (const username of userList) {
      const userDoc = await findUser(guildId, username);

      if (userDoc?.strikes?.length) {
        warningsList.push(`${userDoc.username} - ${userDoc.strikes.length}`);
      }
    }

    if (!warningsList.length) {
      return 'I have no record of any warned users.';
    }

    return warningsList.join('\n');
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns the list of a user's warnings.
 */
export const getUserWarnings = async (member: GuildMember) => {
  try {
    const user = await getUser(member);

    if (!user.strikes?.length) {
      return `${member.user.username} has no strikes.`;
    }

    let reply = `${member.user.username}\n`;

    for await (const warning of user.strikes) {
      reply = `${reply}- ${warning}\n`;
    }

    return reply;
  } catch (error) {
    throw error;
  }
};
