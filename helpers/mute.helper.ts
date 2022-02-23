import { GuildMember } from 'discord.js';

import { getUser } from './member.helper';
import { saveDoc } from './database.helper';
import { addTime } from './utils.helper';

export const muteUser = async (member: GuildMember, reason: string, minutes?: number) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = member.guild.roles.cache.find((guildRole) => guildRole.name.toLowerCase() === 'muted');

    if (!role) return;

    for (const channel of member.guild.channels.cache.array()) {
      channel.updateOverwrite(role, {
        SEND_MESSAGES: false,
        ADD_REACTIONS: false
      });
    }

    if (minutes) {
      reason = reason.replace(minutes.toString() || '', '');
      reason = `${reason} for ${minutes} minutes.`;
      user.timer = addTime('minutes', minutes);
    }

    user.strikes = user.strikes || [];

    if (!user.strikes.includes(reason)) {
      user.strikes.push(reason);
    }

    if (!member.roles.cache.has(role.id)) {
      await member.roles.add(role);
    }

    user.roles = user.roles || [];

    if (!user.roles.includes(role.id)) {
      user.roles.push(role.id);
    }

    saveDoc(user, member.guild.id, member.user.id);

    return `${member.displayName} has been muted.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

export const unmuteUser = async (member: GuildMember) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = member.guild.roles.cache.find((guildRole) => guildRole.name.toLowerCase() === 'muted');

    if (!role) return;

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
    }

    user.roles = user.roles || [];

    if (user.roles.includes(role.id)) {
      user.roles.splice(user.roles.indexOf(role.id), 1);
    }

    saveDoc(user, member.guild.id, member.user.id);

    return `${member.displayName} has been unmuted.`;
  } catch (error) {
    throw error;
  }
};
