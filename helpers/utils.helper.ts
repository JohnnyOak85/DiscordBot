import { Guild, MessageEmbed } from 'discord.js';
import moment, { unitOfTime } from 'moment';
import { scheduleJob } from 'node-schedule';
import { createLogger, format, transports } from 'winston';

import { unmuteUser } from './roles.helper';
import { getUserDoc, readDirectory } from './storage.helper';

const logger = createLogger({
  level: 'info',
  format: format.printf((log) => `[${log.level.toUpperCase()}] - ${log.message}`),
  defaultMeta: { service: 'user-service' },
  transports: [new transports.File({ filename: 'logs/log.txt' })]
});

/**
 * @description Returns a timestamp from the current date until the amount and type of time given.
 */
export const addTime = (type: unitOfTime.DurationConstructor, amount: number) => moment().add(amount, type).format();

/**
 * @description Returns the current date.
 */
export const getDate = (date = new Date(), timeFormat = 'Do MMMM YYYY, h:mm:ss a') => moment(date).format(timeFormat);

/**
 * @description Compare two dates.
 */
export const compareDate = (firstDate: Date, secondDate: Date): boolean => moment(firstDate).isAfter(secondDate);

/**
 * @description Transforms the given number string into a number.
 */
export const getNumber = (amount: string) => {
  const numberAmount = parseInt(amount, 10);

  if (numberAmount && numberAmount > 0 && numberAmount < 100 && !isNaN(numberAmount)) {
    return numberAmount;
  }
};

export const getReason = (reason: string, prefix?: string) => {
  if (!reason) {
    reason = 'No reason provided';
  }
  if (prefix) {
    reason = reason.replace(prefix, '');
  }

  return `Reason: ${reason}`;
};

/**
 * @description Logs an error entry.
 */
export const logError = (error: Error) => {
  console.log(error);
  logger.log('error', `${error.message}\n${error}\nTime: ${getDate()}`);
};

/**
 * @description Logs an information entry.
 */
export const logInfo = (message: string) => {
  logger.log('info', `${message}\nTime: ${getDate()}`);
};

/**
 * @description Starts timers for repeated tasks.
 */
export const startTimers = async (guild: Guild) => {
  // Once per day at midnight check anniversaries.
  scheduleJob('1 0 * * *', async () => {
    const userDocs = await readDirectory(guild.id);

    for (const docPath of userDocs) {
      const user = await getUserDoc(`${guild.id}/${docPath.replace('.json', '')}`);

      if (!user.anniversary || moment(user.timer).isBefore(moment().format())) return;

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
  });

  // Once per 5 seconds check times.
  scheduleJob('*/5 * * * * *', async () => {
    const userDocs = await readDirectory(guild.id);

    for (const docPath of userDocs) {
      const user = await getUserDoc(`${guild.id}/${docPath.replace('.json', '')}`);

      if (!user.timer || moment(user.timer).isBefore(moment().format())) return;

      const guildUser = guild.members.cache.get(user._id || '');

      if (guildUser) {
        unmuteUser(guildUser);
      }
    }
  });
};
