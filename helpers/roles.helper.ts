// Dependencies
import { GuildMember, Role, RoleManager, TextChannel } from 'discord.js';

// Helpers
import { updatePermissions } from './channels.helper';
import { getUser } from './member.helper';
import { getDoc, saveDoc } from './storage.helper';
import { addTime, getNumber, logInfo } from './utils.helper';

// Models
import { RoleSchema } from '../models/role.model';

/**
 * @description Creates a new role in the guild.
 * @param roleManager
 * @param roleName
 */
const createRole = async (roleManager: RoleManager, roleName: string, channel: TextChannel | null | undefined): Promise<Role> => {
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
 * @param roleManager
 * @param roleName
 */
const getRole = async (
  roleManager: RoleManager | undefined,
  roleName: string,
  channel: TextChannel | null | undefined
): Promise<Role | void> => {
  try {
    if (!roleManager) return;
    const role = roleManager.cache.find((guildRole) => guildRole.name.toLowerCase() === roleName);

    if (!role) return await createRole(roleManager, roleName, channel);

    return role;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Gives a new role to a user.
 * @param member
 */
const giveRole = async (member: GuildMember, roleName: string): Promise<void> => {
  try {
    const user = await getUser(member);
    const role = await getRole(member.guild.roles, roleName, member.guild.systemChannel);

    if (!role) return;
    if (!member.roles.cache.has(role.id)) await member.roles.add(role);
    if (!user.roles.includes(role.id)) user.roles.push(role.id);

    saveDoc(`${member.guild.id}/${member.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Removes a role from a user.
 * @param member
 */
const removeRole = async (member: GuildMember, roleName: string): Promise<void> => {
  try {
    const user = await getUser(member);
    const role = await getRole(member.guild.roles, roleName, member.guild.systemChannel);

    if (!role) return;

    if (member.roles.cache.has(role.id)) await member.roles.remove(role);

    if (user.roles.includes(role.id)) user.roles.splice(user.roles.indexOf(role.id), 1);

    saveDoc(`${member.guild.id}/${member.user.id}`, user);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Gives a user the muted role, which makes it impossible to send messages to the guild.
 * @param member
 * @param reason
 * @param time
 */
const muteUser = async (member: GuildMember, reason: string, minutes?: number): Promise<string | undefined> => {
  try {
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

    if (!user.strikes.includes(reason)) user.strikes.push(reason);
    if (!member.roles.cache.has(role.id)) await member.roles.add(role);
    if (!user.roles.includes(role.id)) user.roles.push(role.id);

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `${member.displayName} has been muted.\n${reason}`;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Removes the mute role from the user, allowing them to once again send messages to the guild.
 * @param member
 */
const unmuteUser = async (member: GuildMember): Promise<string | undefined> => {
  try {
    const user = await getUser(member);
    const role = await getRole(member.guild.roles, 'muted', member.guild.systemChannel);

    if (!role) return;

    if (member.roles.cache.has(role.id)) await member.roles.remove(role);

    if (user.roles.includes(role.id)) user.roles.splice(user.roles.indexOf(role.id), 1);

    saveDoc(`${member.guild.id}/${member.user.id}`, user);

    return `${member.displayName} has been unmuted.`;
  } catch (error) {
    throw error;
  }
};

export { getRole, giveRole, muteUser, removeRole, unmuteUser };
