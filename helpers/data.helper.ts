import { Emoji, Guild, GuildEmoji, Message, Role } from 'discord.js';
import { ensureDirSync } from 'fs-extra';

import { ensureUser, recordBannedUser } from './member.helper';
import { docExists, getDoc, saveDoc, updateDoc } from './tools/database.helper';
import { logError, logInfo } from './tools/utils.helper';
import { setRolesChannel } from './roles.helper';
import { startTimers } from './timers.helper';
import { setCommands } from './command.helper';

import { DATABASE_DIR, REACTION_TOTAL, QUOTE_REACTION } from '../config.json';
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
      recordBannedUser(ban.user, ban.reason, guild.id);
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
      setCommands();
      recordData(guild);
      setRolesChannel(guild.channels.cache.array());
      startTimers(guild);
    }

    console.log('Ready.');
  } catch (error) {
    logError(error);
  }
};

export const recordQuote = async (message: Message, emoji: string, count: number) => {
  if (count < REACTION_TOTAL || emoji !== QUOTE_REACTION) return;

  try {
    const quotes = await getDoc<string[]>('', 'quotes');

    quotes.push(`${message.content}\n${message.member?.nickname}, ${message.createdAt.getFullYear()}`);

    saveDoc(quotes, '', 'quotes');
  } catch (error) {
    logError(error);
  }
};
