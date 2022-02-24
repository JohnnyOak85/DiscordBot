import moment, { unitOfTime } from 'moment';
import { createLogger, format, transports } from 'winston';

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

export const getRandom = (max: number, min = 1) => Math.floor(Math.random() * (max - min + 1) + min);
export const getBool = () => Math.random() < 0.5;

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
export const logError = (error: any) => {
  console.log(error);
  logger.log('error', `${error.message}\n${error}\nTime: ${getDate()}`);
};

/**
 * @description Logs an information entry.
 */
export const logInfo = (message: string) => {
  logger.log('info', `${message}\nTime: ${getDate()}`);
};
