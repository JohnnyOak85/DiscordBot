// Dependencies
import {
  Guild,
  GuildChannel,
  GuildChannelManager,
  MessageEmbed,
  NewsChannel,
  PermissionOverwriteOption,
  Role,
  TextChannel
} from 'discord.js';

// Helpers
import { logInfo } from './utils.helper';

// Models
import { ChannelSchema } from '../models/channel.model';

// Configurations
import { RULE_LIST } from '../config.json';

// Resources
import { getDoc } from './storage.helper';
import { collectReactions } from './reaction.helper';
import { colorEmojis } from '../resources/reaction-roles';

/**
 * @description Sends a message with the rules list to the system channel.
 * @param channel
 */
const setRules = async (channel: TextChannel | NewsChannel | null | undefined, rules: string[]): Promise<void> => {
  try {
    if (!channel?.isText()) return;

    let reply = '```markdown\n';

    for (const rule of rules) {
      reply += `* ${rule}\n`;
    }

    reply += '```';

    const messages = await channel.messages.fetch();

    for await (const message of messages.array()) {
      if (message.content !== reply) message.delete();
    }

    if (!messages.array().length) channel.send(reply);
  } catch (error) {
    throw error;
  }
};

/**
 * Sets up an embed with color emotes to give color roles to users.
 * @param channel
 */
const setColorRoles = async (channel: TextChannel | NewsChannel): Promise<void> => {
  try {
    const colorEmbed = new MessageEmbed({
      color: 'DEFAULT',
      title: 'React to pick your color role.'
    });

    const messages = await channel.messages.fetch();

    if (!messages.array().length) {
      const message = await channel.send(colorEmbed);

      collectReactions(message, colorEmojis);

      return;
    }

    const previous = messages.array().find((message) => message.embeds.filter((embed) => embed.title === colorEmbed.title));

    if (!previous) {
      const message = await channel.send(colorEmbed);

      collectReactions(message, colorEmojis);
    }

    for await (const message of messages.array()) collectReactions(message, colorEmojis);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates a new channel in the information category.
 * @param guild
 * @param channelName
 * @param category
 * @param system
 */
const buildInfoChannel = async (guild: Guild, channelName: string): Promise<GuildChannel | void> => {
  try {
    const channel = await getChannel(guild.channels, channelName, guild.systemChannel);
    const category = await getChannel(guild.channels, 'information', guild.systemChannel);

    if (!channel || !category) return;

    await channel.setParent(category.id);

    return channel;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates the information category.
 * @param guild
 */
const buildInfoCategory = async (guild: Guild): Promise<void> => {
  try {
    const rulesChannel = await buildInfoChannel(guild, 'rules');
    if (rulesChannel && rulesChannel.isText()) setRules(rulesChannel, RULE_LIST);

    const eventsChannel = await buildInfoChannel(guild, 'events');
    if (eventsChannel) guild.setSystemChannel(eventsChannel);

    const rolesChannel = await buildInfoChannel(guild, 'roles');
    if (rolesChannel && rolesChannel.isText()) setColorRoles(rolesChannel);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Creates a new channel on the guild.
 * @param channelManager
 * @param channelName
 * @param systemChannel
 */
const createChannel = async (
  channelManager: GuildChannelManager | undefined,
  channelName: string,
  systemChannel: TextChannel | null | undefined
): Promise<GuildChannel | undefined> => {
  try {
    if (!channelManager) return;

    const channelSchema = await getDoc<ChannelSchema>(`configurations/channels/${channelName}`);
    const channel = await channelManager.create(channelSchema.name, channelSchema.options);

    systemChannel?.send(`Created new channel <#${channel?.id}>!`);
    logInfo(`Created channel ${channelSchema.name} on ${channelManager?.guild.name}.`);

    return channel;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Retrieves a new channel from the guild.
 * @param channelManager
 * @param channelName
 * @param systemChannel
 */
const getChannel = async (
  channelManager: GuildChannelManager | undefined,
  channelName: string,
  systemChannel: TextChannel | null | undefined
): Promise<GuildChannel | void> => {
  try {
    if (!channelManager) return;

    const channel = channelManager.cache.find((guildChannel) => guildChannel.name === channelName);

    if (!channel) return await createChannel(channelManager, channelName, systemChannel);

    return channel;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Updates permissions of a channel by given role.
 * @param channelManager
 * @param role
 * @param permissions
 */
const updatePermissions = async (channelManager: GuildChannelManager, role: Role, permissions: PermissionOverwriteOption) => {
  for (const channel of channelManager?.cache.array()) {
    channel.updateOverwrite(role, permissions);
  }
};

export { buildInfoCategory, getChannel, setRules, updatePermissions };
