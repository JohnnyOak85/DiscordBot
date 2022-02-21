import { Emoji, Guild, GuildEmoji, GuildMember, Role, User } from 'discord.js';
import { ensureDirSync, pathExistsSync, readdirSync, readJsonSync, writeJsonSync } from 'fs-extra';

import { buildBannedUser, getUser } from './member.helper';
import { logInfo } from './utils.helper';

import { DATABASE_DIR } from '../config.json';
import { Dictionary } from '../interfaces/dictionary.interface';

interface BannedUser {
  user: User;
  reason: string;
}

function recordBannedUsers(users: BannedUser[], guild: string) {
  for (const ban of users) {
    const user = buildBannedUser(ban.user, ban.reason);
    const path = `${guild}/${user._id}`;

    if (user._id && pathExistsSync(`${path}.json`)) {
      saveDoc(path, user);
    }
  }
}

async function recordUsers(users: GuildMember[], guild: string) {
  for (const member of users) {
    const user = await getUser(member);
    const path = `${guild}/${user._id}`;

    if (pathExistsSync(`${path}.json`)) {
      saveDoc(path, user);
    }
  }
}

async function recordMap(list: (GuildEmoji | Role)[], mapName: string) {
  const map: Dictionary<string> = {};

  for (const item of list) {
    map[item.id] = item.name;
  }

  saveDoc(`configurations/${mapName}`, map);
}

/**
 * @description Constructs all the user docs from a guild.
 */
export const buildDatabase = async (guild: Guild) => {
  try {
    const members = await guild.members.fetch();
    const banned = await guild.fetchBans();

    ensureDirSync(`${DATABASE_DIR}/${guild.id}`);
    recordBannedUsers(banned.array(), guild.id);
    recordUsers(members.array(), guild.id);
    recordMap(guild.emojis.cache.array(), 'emojis');
    recordMap(guild.roles.cache.array(), 'roles');

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
    const list = readdirSync(`${DATABASE_DIR}/${path}`);
    const files = [];

    for (const file of list) {
      files.push(file.replace('.json', ''));
    }

    return files;
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

export const recordItem = async (item: Role | Emoji, map: string, record = true) => {
  try {
    if (!item.id) return;

    const path = `configurations/${map}`;
    const doc = await getDoc<Dictionary<string>>(path);

    if (record) {
      doc[item.id] = item.name;
    } else {
      delete doc[item.id];
    }

    saveDoc(path, doc);
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
