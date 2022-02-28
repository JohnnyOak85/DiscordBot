import { GuildChannel, GuildMember, Role, TextChannel } from 'discord.js';

import { buildEmbed } from './tools/embed.helper';
import { setReactionMessage } from './reaction.helper';

import { ROLES_DESCRIPTION } from '../config.json';
import { getDoc } from './tools/database.helper';
import { DataList } from '../interfaces';

const getName = (roles: Role[], list: string[]) =>
  roles.find((r) => list.includes(r.name.toLowerCase()))?.name.toLowerCase() || '';
const findName = (roles: Role[]) => getDoc<DataList>('game', 'ranks').then((l) => l[getName(roles, Object.keys(l))]);

export const addRole = async (roles: Role[], members: GuildMember[], roleName: string, memberId: string) => {
  const role = roles.find((r) => r.name.toLowerCase().includes(roleName.toLowerCase()));
  const member = members.find((m) => m.id === memberId);

  if (!roleName || !role || !member) return;

  member.roles.add(role);
};

export const removeRole = async (roles: Role[], members: GuildMember[], roleName: string, memberId: string) => {
  const role = roles.find((r) => r.name.includes(roleName));
  const member = members.find((m) => m.id === memberId);

  if (!role || !member) return;

  member.roles.remove(role);
};

export const upgradeRole = async (members: GuildMember[], memberId: string, level: number) => {
  if (level !== 40 && level !== 20) return;

  const member = members.find((m) => m.id === memberId);
  const name = await findName(member?.roles.cache.array() || []);
  const upgrade = member?.guild.roles.cache.find((r) => r.name.toLowerCase() === name);

  if (!upgrade || !member) return;

  addRole([upgrade], [member], upgrade?.name, member?.id);

  const toRemove = member.guild.roles.cache.filter((r) => r !== upgrade);

  bulkRemoveRoles(member, toRemove.array(), Object.keys(await getDoc<DataList>('game', 'ranks')));

  return upgrade.name;
};

export const bulkRemoveRoles = (member: GuildMember, roles: Role[], list: string[]) => {
  for (const roleId of list) {
    const role = roles.find((r) => r.name.toLowerCase() === roleId);

    if (!role || !member.roles.cache.find((r) => r === role)) continue;

    member.roles.remove(role);
  }
};

export const bulkAddRoles = (member: GuildMember, roles: Role[], list: string[]) => {
  for (const roleId of list) {
    const role = roles.find((r) => r.id === roleId);

    if (!role) continue;

    member.roles.add(role);
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
