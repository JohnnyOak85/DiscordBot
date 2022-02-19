import { GuildMember, PermissionOverwriteOption, PermissionResolvable, RoleManager, TextChannel } from 'discord.js';

import { updatePermissions } from './channels.helper';
import { getUser } from './member.helper';
import { getDoc, saveDoc } from './storage.helper';
import { addTime, logInfo } from './utils.helper';

interface RoleSchema {
  activePermissions: PermissionResolvable;
  inactivePermissions: PermissionOverwriteOption;
  name: string;
}

/**
 * @description Creates a new role in the guild.
 */
const createRole = async (roleManager: RoleManager, roleName: string, channel: TextChannel) => {
  try {
    const roleSchema = await getDoc<RoleSchema>(`configurations/roles/${roleName}`);
    const role = await roleManager.create({
      data: {
        name: roleSchema.name,
        permissions: roleSchema.activePermissions
      }
    });

    channel?.send(`Created new role ${roleSchema.name}.`);
    logInfo(`Created role ${roleSchema.name} on ${roleManager.guild.name}.`);

    return role;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Retrieves a role entity.
 */
export const getRole = async (roleManager: RoleManager, roleName: string, channel: TextChannel) => {
  try {
    if (!roleManager) return;
    const role = roleManager.cache.find((guildRole) => guildRole.name.toLowerCase() === roleName.toLowerCase());

    if (!role) {
      return await createRole(roleManager, roleName, channel);
    }

    return role;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Gives a new role to a user.
 */
export const giveRole = async (member: GuildMember, roleName: string) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = await getRole(member.guild.roles, roleName, member.guild.systemChannel);

    if (!role) return;

    if (!member.roles.cache.has(role.id)) {
      await member.roles.add(role);
    }

    user.roles = user.roles || [];
    if (!user.roles.includes(role.id)) {
      user.roles.push(role.id);
    }

    saveDoc(`${member.guild.id}/${member.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Removes a role from a user.
 */
export const removeRole = async (member: GuildMember, roleName: string) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = await getRole(member.guild.roles, roleName, member.guild.systemChannel);

    if (!role) return;

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
    }

    user.roles = user.roles || [];

    if (user.roles.includes(role.id)) {
      user.roles.splice(user.roles.indexOf(role.id), 1);
    }

    saveDoc(`${member.guild.id}/${member.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Gives a user the muted role, which makes it impossible to send messages to the guild.
 */
export const muteUser = async (member: GuildMember, reason: string, minutes?: number) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = await getRole(member.guild.roles, 'muted', member.guild.systemChannel);

    if (!role) return;

    const roleSchema = await getDoc<RoleSchema>(`configurations/roles/muted`);
    updatePermissions(member.guild.channels, role, roleSchema.inactivePermissions);

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

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `${member.displayName} has been muted.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Removes the mute role from the user, allowing them to once again send messages to the guild.
 */
export const unmuteUser = async (member: GuildMember) => {
  try {
    if (!member.guild.systemChannel) return;

    const user = await getUser(member);
    const role = await getRole(member.guild.roles, 'muted', member.guild.systemChannel);

    if (!role) return;

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
    }

    user.roles = user.roles || [];

    if (user.roles.includes(role.id)) {
      user.roles.splice(user.roles.indexOf(role.id), 1);
    }

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `${member.displayName} has been unmuted.`;
  } catch (error) {
    throw error;
  }
};
