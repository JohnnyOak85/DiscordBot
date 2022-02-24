import { Emoji, Guild, GuildEmoji, Role } from 'discord.js';
import { ensureDirSync } from 'fs-extra';

import { ensureUser, recordBannedUser } from './member.helper';
import { docExists, getDoc, saveDoc, updateDoc } from './database.helper';
import { logError, logInfo } from './utils.helper';
import { setRolesChannel } from './roles.helper';
import { startTimers } from './timers.helper';

import { DATABASE_DIR } from '../config.json';
import { DataList } from '../interfaces';

async function recordMap(list: (GuildEmoji | Role)[], mapName: string) {
  const map: DataList = {};

  for (const item of list) {
    map[item.id] = item.name;
  }
  saveDoc(map, 'configurations', mapName);
}

const recordData = async (guild: Guild) => {
  try {
    ensureDirSync(`${DATABASE_DIR}/${guild.id}`);

    for (const ban of (await guild.fetchBans()).array()) {
      recordBannedUser(ban, guild.id);
    }

    for (const member of (await guild.members.fetch()).array()) {
      if (await docExists(guild.id, member.id)) {
        updateDoc(ensureUser({}, member), guild.id, member.id);
      } else {
        saveDoc(ensureUser({}, member), guild.id, member.id);
      }
    }

    recordMap(guild.emojis.cache.array(), 'emojis');
    recordMap(guild.roles.cache.array(), 'roles');
  } catch (error) {
    throw error;
  }
};

export const recordItem = async (item: Role | Emoji, map: string, record = true) => {
  try {
    if (!item.id) return;

    const doc = await getDoc<DataList>('configurations', map);

    if (record) {
      doc[item.id] = item.name;
    } else {
      delete doc[item.id];
    }

    saveDoc(doc, 'configurations', map);
  } catch (error) {
    logError(error);
  }
};

export const collectData = (guilds: Guild[]) => {
  try {
    logInfo(`The bot went online.`);

    for (const guild of guilds) {
      recordData(guild);
      setRolesChannel(guild.channels.cache.array());
      startTimers(guild);
    }

    console.log('Ready.');
  } catch (error) {
    logError(error);
  }
};
