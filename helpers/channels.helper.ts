import { Guild, GuildChannelManager, PermissionOverwriteOption, Role } from 'discord.js';

import { logInfo } from './utils.helper';
import { getDoc } from './storage.helper';
import { setRulesChannel } from './channels/rules.helper';
import { setRolesChannel } from './channels/roles.helper';

interface ChannelSchema {
  name: string;
  options: {
    parent?: string;
    permissions: PermissionOverwriteOption;
    position: number;
    type: 'category' | 'text' | 'voice';
  };
}

/**
 * @description Creates a new channel in the information category.
 */
export const buildInfoChannel = async (guild: Guild, channelName: string) => {
  try {
    const channel = await getChannel(guild.channels, channelName);
    const category = await getChannel(guild.channels, 'information');

    if (!channel || !category) return;

    await channel.setParent(category.id);

    return channel;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates a new channel on the guild.
 */
const createChannel = async (channelManager: GuildChannelManager, channelName: string) => {
  try {
    const channelSchema = await getDoc<ChannelSchema>(`configurations/channels/${channelName}`);
    const channel = await channelManager.create(channelSchema.name, channelSchema.options);

    logInfo(`Created channel ${channelSchema.name} on ${channelManager?.guild.name}.`);

    return channel;
  } catch (error) {
    throw error;
  }
};

const setEventsChannel = async (guild: Guild) => {
  try {
    const eventsChannel = await buildInfoChannel(guild, 'events');

    if (eventsChannel) {
      guild.setSystemChannel(eventsChannel);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates the information category.
 */
export const buildInfoCategory = async (guild: Guild) => {
  try {
    setRulesChannel(guild);
    setEventsChannel(guild);
    setRolesChannel(guild);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Retrieves a new channel from the guild.
 */
export const getChannel = async (channelManager: GuildChannelManager, channelName: string) => {
  try {
    const channel = channelManager.cache.find((guildChannel) => guildChannel.name === channelName);

    if (!channel) {
      return await createChannel(channelManager, channelName);
    }

    return channel;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Updates permissions of a channel by given role.
 */
export const updatePermissions = async (
  channelManager: GuildChannelManager,
  role: Role,
  permissions: PermissionOverwriteOption
) => {
  for (const channel of channelManager.cache.array()) {
    channel.updateOverwrite(role, permissions);
  }
};
