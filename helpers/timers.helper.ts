import { Guild, MessageEmbed } from 'discord.js';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';

import { findUser } from './member.helper';
import { unmuteUser } from './mute.helper';
import { listDocs } from './database.helper';

const MIDNIGHT = '1 0 * * *';
const FIVE_SECONDS = '*/5 * * * * *';

const checkAnniversaries = async (guild: Guild) => {
  const userDocs = await listDocs(guild.id);

  for (const docPath of userDocs) {
    const user = await findUser(guild.id, docPath);

    if (!user?.anniversary || moment(user.timer).isBefore(moment().format())) return;

    const guildUser = guild.members.cache.get(user._id || '');

    if (!guildUser || !guild.systemChannel) return;

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('HAPPY ANNIVERSARY!')
      .setThumbnail(guildUser.user.avatarURL() || '')
      .setURL('https://www.youtube.com/watch?v=8zgz2xBrvVQ')
      .addField(`It's ${guildUser.nickname}'s anniversary!`, 'Everyone party!');

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

/**
 * @description Starts timers for repeated tasks.
 */
export const startTimers = async (guild: Guild) => {
  scheduleJob(MIDNIGHT, () => checkAnniversaries(guild));
  scheduleJob(FIVE_SECONDS, () => checkExpirations(guild));
};
