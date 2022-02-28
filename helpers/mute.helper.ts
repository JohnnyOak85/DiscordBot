import { GuildMember } from 'discord.js';

import { getUser } from './member.helper';
import { addRole, removeRole } from './roles.helper';
import { saveDoc } from './tools/database.helper';
import { addTime } from './tools/utils.helper';

export const muteUser = async (member: GuildMember, reason: string, minutes?: number) => {
  try {
    const user = await getUser(member);

    if (minutes) {
      reason = reason.replace(minutes.toString() || '', '');
      reason = `${reason} for ${minutes} minutes.`;
      user.timer = addTime('minutes', minutes);
    }

    user.strikes = user.strikes || [];

    if (!user.strikes.includes(reason)) {
      user.strikes.push(reason);
    }

    addRole(member.guild.roles.cache.array(), [member], 'muted', member.id);

    saveDoc(user, member.guild.id, member.user.id);

    return `${member.displayName} has been muted.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

export const unmuteUser = async (member: GuildMember) => {
  try {
    removeRole(member.guild.roles.cache.array(), [member], 'muted', member.id);

    return `${member.displayName} has been unmuted.`;
  } catch (error) {
    throw error;
  }
};
