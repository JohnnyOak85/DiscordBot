import { Guild } from 'discord.js';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';

import { findUser } from './member.helper';
import { unmuteUser } from './mute.helper';
import { listDocs } from './tools/database.helper';
import { buildEmbed } from './tools/embed.helper';

const MIDNIGHT = '1 0 * * *';
const FIVE_SECONDS = '*/5 * * * * *';

const checkAnniversaries = async (guild: Guild) => {
  const userDocs = await listDocs(guild.id);

  for (const docPath of userDocs) {
    const user = await findUser(guild.id, docPath);

    if (!user?.anniversary || user.removed || moment(user.timer).isBefore(moment().format())) return;

    const guildUser = guild.members.cache.get(user._id || '');

    if (!guildUser || !guild.systemChannel) return;

    const embed = buildEmbed({
      color: 'RANDOM',
      title: 'HAPPY ANNIVERSARY!',
      thumb: guildUser.user.avatarURL(),
      url: 'https://www.youtube.com/watch?v=8zgz2xBrvVQ'
    });

    embed.addField(`It's ${guildUser.nickname}'s anniversary!`, 'Everyone party!');

    guild.systemChannel.send(embed);
  }
};

const checkExpirations = async (guild: Guild) => {
  const userDocs = await listDocs(guild.id);

  for (const docPath of userDocs) {
    const user = await findUser(guild.id, docPath);

    if (!user?.timer || moment(user.timer).isBefore(moment().format())) return;

    const guildUser = guild.members.cache.get(user._id || '');

    if (guildUser) {
      unmuteUser(guildUser);
    }
  }
};

export const startTimers = async (guild: Guild) => {
  try {
    scheduleJob(MIDNIGHT, () => checkAnniversaries(guild));
    scheduleJob(FIVE_SECONDS, () => checkExpirations(guild));
  } catch (error) {
    throw error;
  }
};
