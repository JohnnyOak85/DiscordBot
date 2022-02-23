import { Guild } from 'discord.js';

import { buildInfoChannel } from '../channels.helper';
import { buildEmbed } from '../embed.helper';
import { setReactionMessage } from '../reaction.helper';

import { ROLES_DESCRIPTION } from '../../config.json';

export const setRolesChannel = async (guild: Guild) => {
  try {
    const rolesChannel = await buildInfoChannel(guild, 'roles');

    if (rolesChannel?.isText()) {
      const colorEmbed = buildEmbed({ title: 'React to pick your color.' });
      const roleEmbed = buildEmbed({
        description: ROLES_DESCRIPTION,
        title: 'React to pick your roles.'
      });

      setReactionMessage(colorEmbed, 'colors', rolesChannel);
      setReactionMessage(roleEmbed, 'roles', rolesChannel, true);
    }
  } catch (error) {
    throw error;
  }
};
