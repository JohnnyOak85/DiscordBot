import { PermissionOverwriteOption } from 'discord.js';

interface ChannelSchema {
  name: string;
  options: {
    parent?: string;
    permissions: PermissionOverwriteOption;
    position: number;
    type: 'category' | 'text' | 'voice';
  };
}

export { ChannelSchema };
