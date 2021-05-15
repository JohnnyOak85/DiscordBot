// Dependencies
import { Guild, MessageEmbed } from 'discord.js';
import moment, { unitOfTime } from 'moment';
import { scheduleJob } from 'node-schedule';
import { createLogger, format, transports } from 'winston';
import { Console } from 'winston/lib/winston/transports';
import { unmuteUser } from './roles.helper';
import { getDoc, getUserDoc, readDirectory } from './storage.helper';

const logger = createLogger({
  level: 'info',
  format: format.printf((log) => `[${log.level.toUpperCase()}] - ${log.message}`),
  defaultMeta: { service: 'user-service' },
  transports: [new transports.File({ filename: 'logs/log.txt' })]
});

/**
 * @description Returns a timestamp from the current date until the amount and type of time given.
 * @param type
 * @param amount
 */
const addTime = (type: unitOfTime.DurationConstructor, amount: number): string => moment().add(amount, type).format();

/**
 * @description Returns the current date.
 */
const getDate = (date = new Date(), format = 'Do MMMM YYYY, h:mm:ss a'): string => moment(date).format(format);

/**
 * @description Compare two dates.
 * @param date
 */
const compareDate = (firstDate: Date, secondDate: Date): boolean => moment(firstDate).isAfter(secondDate);

/**
 * @description Transforms the given number string into a number.
 * @param amount
 */
const getNumber = (amount: string): number | undefined => {
  const number = parseInt(amount);

  if (number && number > 0 && number < 100 && !isNaN(number)) return number;
};

/**
 * @description Logs an error entry.
 * @param error
 */
const logError = (error: Error): void => {
  console.log(error);
  logger.log('error', `${error.message}\n${error}\nTime: ${getDate()}`);
};

/**
 * @description Logs an information entry.
 * @param message
 */
const logInfo = (message: string): void => {
  logger.log('info', `${message}\nTime: ${getDate()}`);
};

/**
 * @description Starts timers for repeated tasks.
 */
const startTimers = async (guild: Guild): Promise<void> => {
  // Once per day at midnight check anniversaries.
  scheduleJob('1 0 * * *', async () => {
    const userDocs = await readDirectory(guild.id);

    for (const docPath of userDocs) {
      const user = await getUserDoc(`${guild.id}/${docPath}`);

      if (!user.anniversary || moment(user.timer).isBefore(moment().format())) return;

      const guildUser = guild.members.cache.get(user._id);

      const anniversaryEmbed = new MessageEmbed({
        color: 'RANDOM',
        fields: [
          {
            name: `It's ${guildUser?.nickname}'s anniversary!`,
            value: 'Everyone party!'
          }
        ],
        title: 'HAPPY ANNIVERSARY!',
        thumbnail: {
          url: guildUser?.user.avatarURL() || ''
        },
        url: 'https://www.youtube.com/watch?v=8zgz2xBrvVQ'
      });

      guild.systemChannel?.send(anniversaryEmbed);
    }
  });

  // Once per 5 seconds check times.
  scheduleJob('*/5 * * * * *', async () => {
    const userDocs = await readDirectory(guild.id);

    for (const docPath of userDocs) {
      const user = await getUserDoc(`${guild.id}/${docPath}`);

      if (!user.timer || moment(user.timer).isBefore(moment().format())) return;

      const guildUser = guild.members.cache.get(user._id);

      if (guildUser) unmuteUser(guildUser);
    }
  });
};

/**
 * @description Checks the a string against a list of illegal words.
 * @param message
 */
const hasIllegalWord = async (message: string): Promise<boolean> => {
  try {
    const illegalWords = await getDoc<List>('configurations/illegal_words');

    if (illegalWords.ILLEGAL_WORDS.some((word) => message.toLocaleLowerCase().includes(word))) return true;

    return false;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Checks the a string against a list of illegal sites.
 * @param message
 */
const hasIllegalWebsite = async (message: string): Promise<boolean> => {
  try {
    const illegalSites = await getDoc<List>('configurations/illegal_sites');

    if (illegalSites.ILLEGAL_SITES.some((site) => message.toLocaleLowerCase().includes(site))) return true;

    return false;
  } catch (error) {
    throw error;
  }
};

export { addTime, compareDate, getDate, getNumber, hasIllegalWebsite, hasIllegalWord, logError, logInfo, startTimers };
