import { GuildChannelManager, Invite } from 'discord.js';

const createInvite = async (channelManager: GuildChannelManager, channelId: string) => {
  try {
    let channel = channelManager.cache.find((guildChannel) => guildChannel.name === channelId);

    if (!channel) {
      channel = channelManager.cache.find((guildChannel) => guildChannel.name === 'general-chat');
    }

    return channel?.createInvite({ temporary: false });
  } catch (error) {
    throw error;
  }
};

export const getInvite = async (list: Invite[], channelManager: GuildChannelManager, channelName: string) => {
  try {
    if (!list.length) {
      return await createInvite(channelManager, channelName);
    }

    const permanentInvite = list.find((invite) => !invite.temporary && invite.channel.name === channelName);

    return permanentInvite ? permanentInvite : await createInvite(channelManager, channelName);
  } catch (error) {
    throw error;
  }
};
