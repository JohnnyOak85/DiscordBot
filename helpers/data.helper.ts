import { Emoji, Guild, GuildEmoji, Role } from 'discord.js';
import { ensureDirSync } from 'fs-extra';

import { ensureUser, recordBannedUser } from './member.helper';
import { docExists, getDoc, saveDoc, updateDoc } from './database.helper';

import { DATABASE_DIR } from '../config.json';
import { DataList } from '../interfaces';

async function recordMap(list: (GuildEmoji | Role)[], mapName: string) {
  const map: DataList = {};

  for (const item of list) {
    map[item.id] = item.name;
  }
  saveDoc(map, 'configurations', mapName);
}

export const recordData = async (guild: Guild) => {
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
    console.log(error);
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
    throw error;
  }
};
