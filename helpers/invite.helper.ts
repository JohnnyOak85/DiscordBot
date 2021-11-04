// Dependencies
import { Guild, GuildChannelManager } from 'discord.js';

/**
 * @description Creates a new permanent invite for the given channel, otherwise it finds the one for general.
 * @param channelManager
 * @param channelName
 */
const createInvite = async (channelManager: GuildChannelManager, channelName: string) => {
  try {
    let channel = channelManager.cache.find((guildChannel) => guildChannel.name === channelName);
    if (!channel) channel = channelManager.cache.find((guildChannel) => guildChannel.name === 'general-chat');

    return channel?.createInvite({ temporary: false });
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns a permanent invite for the given channel, otherwise it will default to the general channel..
 * @param inviteList
 */
export const getInvite = async (guild: Guild, channelName: string) => {
  try {
    if (!guild) return;

    const inviteList = await guild.fetchInvites();
    if (!inviteList) return await createInvite(guild.channels, channelName);

    const permanentInvite = inviteList.filter((invite) => !invite.temporary);
    if (!permanentInvite.array().length) return await createInvite(guild.channels, channelName);

    const filteredInvite = permanentInvite.filter((invite) => invite.channel.name === channelName);
    if (!filteredInvite.array().length) return await createInvite(guild.channels, channelName);

    return filteredInvite.array()[0];
  } catch (error) {
    throw error;
  }
};
