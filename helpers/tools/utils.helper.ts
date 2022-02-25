import moment, { unitOfTime } from 'moment';
import { createLogger, format, transports } from 'winston';

import { control } from '../../game-config.json';

const logger = createLogger({
  level: 'info',
  format: format.printf((log) => `[${log.level.toUpperCase()}] - ${log.message}`),
  defaultMeta: { service: 'user-service' },
  transports: [new transports.File({ filename: 'logs/log.txt' })]
});

export const addTime = (type: unitOfTime.DurationConstructor, amount: number) => moment().add(amount, type).format();
export const getDate = (date = new Date(), timeFormat = 'Do MMMM YYYY, h:mm:ss a') => moment(date).format(timeFormat);
export const compareDate = (firstDate: Date, secondDate: Date): boolean => moment(firstDate).isAfter(secondDate);

const checkControl = (num: number) => num * control + (num - 1) * control;
const checkAmount = (amount: number) => amount && amount > 0 && amount < 99 && !isNaN(amount);

export const getNumber = (amount: string) => (checkAmount(parseInt(amount, 10)) ? parseInt(amount, 10) : undefined);
export const getRandom = (max = 100, min = 1) => Math.floor(Math.random() * (max - min + 1) + min);
export const increment = (num: number, toInc: number) => (num >= checkControl(toInc) ? toInc + 1 : toInc);
export const getBool = () => Math.random() < 0.5;

export const getReason = (reason: string) => (reason ? `Reason: ${reason}` : 'No reason provided');

export const logError = (error: any) => logger.log('error', `${error.message}\n${error}\nTime: ${getDate()}`);
export const logInfo = (message: string) => logger.log('info', `${message}\nTime: ${getDate()}`);
