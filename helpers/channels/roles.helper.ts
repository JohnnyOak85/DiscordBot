import { Guild } from 'discord.js';

import { buildInfoChannel } from '../channels.helper';
import { getEmbed } from '../embed.helper';
import { setReactionMessage } from '../reaction.helper';

export const setRolesChannel = async (guild: Guild) => {
  try {
    const rolesChannel = await buildInfoChannel(guild, 'roles');

    if (rolesChannel && rolesChannel.isText()) {
      const colorEmbed = await getEmbed('color');
      const roleEmbed = await getEmbed('role');

      setReactionMessage(colorEmbed, 'colors', rolesChannel);
      setReactionMessage(roleEmbed, 'roles', rolesChannel);
    }
  } catch (error) {
    throw error;
  }
};
