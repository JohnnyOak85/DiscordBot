import { PermissionOverwriteOption, PermissionResolvable } from 'discord.js';

interface RoleSchema {
  activePermissions: PermissionResolvable;
  inactivePermissions: PermissionOverwriteOption;
  name: string;
}

export { RoleSchema };
