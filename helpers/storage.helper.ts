import { Guild } from 'discord.js';
import { ensureDirSync, pathExistsSync, readdirSync, readJsonSync, writeJsonSync } from 'fs-extra';

import { buildBannedUser, getUser } from './member.helper';
import { logInfo } from './utils.helper';

import { DATABASE_DIR } from '../config.json';

/**
 * @description Constructs all the user docs from a guild.
 */
export const buildDatabase = async (guild: Guild) => {
  try {
    const members = await guild.members.fetch();
    const banned = await guild.fetchBans();

    ensureDirSync(`${DATABASE_DIR}/${guild.id}`);

    for (const ban of banned.array()) {
      const user = buildBannedUser(ban.user, ban.reason);
      const path = `${guild.id}/${user._id}`;

      if (user._id && pathExistsSync(`${path}.json`)) {
        saveDoc(path, user);
      }
    }

    for (const member of members.array()) {
      const user = await getUser(member);
      const path = `${guild.id}/${user._id}`;

      if (pathExistsSync(`${path}.json`)) {
        saveDoc(path, user);
      }
    }

    logInfo(`Built database for ${guild.name}.`);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns the list of files inside a directory.
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
 */
export const getUserDoc = async (path: string) => {
  try {
    if (!pathExistsSync(`${DATABASE_DIR}/${path}.json`)) {
      return {};
    }

    return getDoc<UserDoc>(path);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Returns a file from the database.
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
 */
export const saveDoc = async (path: string, file: UserDoc) => {
  try {
    writeJsonSync(`${DATABASE_DIR}/${path}.json`, file);
    logInfo(`Updated file ${file._id}`);
  } catch (error) {
    throw error;
  }
};
