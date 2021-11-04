// Dependencies
import { Guild } from 'discord.js';
import { ensureDirSync, pathExistsSync, readdirSync, readJsonSync, writeJsonSync } from 'fs-extra';

// Helpers
import { buildBannedUser, getUser } from './member.helper';
import { logInfo } from './utils.helper';

// Configurations
import { DATABASE_DIR } from '../config.json';

/**
 * @description Constructs all the user docs from a guild.
 * @param guild
 */
export const buildDatabase = async (guild: Guild) => {
  try {
    const members = await guild.members.fetch();
    const banned = await guild.fetchBans();

    ensureDirSync(`${DATABASE_DIR}/${guild.id}`);

    for (const ban of banned.array()) {
      const user = buildBannedUser(ban.user, ban.reason);
      if (pathExistsSync(`${guild.id}/${user._id}.json`)) saveDoc(`${guild.id}/${user._id}`, user);
    }

    for (const member of members.array()) {
      const user = await getUser(member);
      if (pathExistsSync(`${guild.id}/${user._id}.json`)) saveDoc(`${guild.id}/${user._id}`, user);
    }

    logInfo(`Built database for ${guild.name}.`);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns the list of files inside a directory.
 * @param path
 */
export const readDirectory = async (path: string) => {
  try {
    return readdirSync(`${DATABASE_DIR}/${path}`);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Ensures a file exists and returns it.
 * @param path
 */
export const getUserDoc = async (path: string) => {
  try {
    if (!pathExistsSync(`${DATABASE_DIR}/${path}.json`))
      saveDoc(path, {
        _id: '',
        anniversary: undefined,
        joinedAt: null,
        nickname: null,
        roles: [],
        strikes: [],
        timer: undefined,
        username: ''
      });

    return readJsonSync(`${DATABASE_DIR}/${path}.json`);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns a file from the database.
 * @param path
 */
export const getDoc = async <T>(path: string): Promise<T> => {
  try {
    return readJsonSync(`${DATABASE_DIR}/${path}.json`);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Saves a file and logs the event.
 * @param path
 * @param file
 */
export const saveDoc = async (path: string, file: UserDoc) => {
  try {
    writeJsonSync(`${DATABASE_DIR}/${path}.json`, file);
    logInfo('Updated file.');
  } catch (error) {
    throw error;
  }
};
