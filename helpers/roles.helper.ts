import { GuildChannel, GuildMember, Role, TextChannel } from 'discord.js';

import { buildEmbed } from './tools/embed.helper';
import { getUser, saveUser } from './member.helper';
import { setReactionMessage } from './reaction.helper';

import { ROLES_DESCRIPTION } from '../config.json';

export const grantRole = async (roles: Role[], members: GuildMember[], name: string, id: string) => {
  const role = roles.find((r) => r.name.includes(name));
  const member = members.find((m) => m.id === id);

  if (!role || !member) return;

  member.roles.add(role);
};

export const giveRole = async (member: GuildMember, roleName: string) => {
  try {
    const user = await getUser(member);
    const role = member.guild.roles.cache.find((guildRole) => guildRole.name.toLowerCase() === roleName.toLowerCase());

    if (!role) return;

    if (!member.roles.cache.has(role.id)) {
      await member.roles.add(role);
    }

    user.roles = user.roles || [];
    if (!user.roles.includes(role.id)) {
      user.roles.push(role.id);
    }

    saveUser(member, user);
  } catch (error) {
    throw error;
  }
};

export const removeRole = async (member: GuildMember, roleName: string) => {
  try {
    const user = await getUser(member);
    const role = member.guild.roles.cache.find((guildRole) => guildRole.name.toLowerCase() === roleName.toLowerCase());

    if (!role) return;

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
    }

    user.roles = user.roles || [];

    if (user.roles.includes(role.id)) {
      user.roles.splice(user.roles.indexOf(role.id), 1);
    }

    saveUser(member, user);
  } catch (error) {
    throw error;
  }
};

export const setRolesChannel = async (channels: GuildChannel[]) => {
  try {
    const rolesChannel = channels.find((channel) => channel.name === 'roles' && channel.type === 'text');

    if (!rolesChannel) return;

    const colorEmbed = buildEmbed({ title: 'React to pick your color.' });
    const roleEmbed = buildEmbed({
      description: ROLES_DESCRIPTION,
      title: 'React to pick your roles.'
    });

    setReactionMessage(colorEmbed, 'colors', rolesChannel as TextChannel);
    setReactionMessage(roleEmbed, 'roles', rolesChannel as TextChannel, true);
  } catch (error) {
    throw error;
  }
};
