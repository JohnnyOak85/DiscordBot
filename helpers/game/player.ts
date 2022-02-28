import { TextChannel } from 'discord.js';

import { findUser } from '../member.helper';
import { getBuffs, getDeBuffs } from './results';

import { Duelist } from '../../interfaces';
import { addRole } from '../roles.helper';
import { BOSSES } from '../../game-config.json';
import { saveDoc } from '../tools/database.helper';

export const getStats = async (guild: string, user: string) => {
  const player = await findUser(guild, user);

  return `\nLevel: ${player?.level}\nHealth: ${player?.health}\nAttack: ${player?.attack}\nDefense: ${player?.defense}\nLuck: ${player?.luck}\nWins: ${player?.wins}\nLosses: ${player?.losses}`;
};

export const ensureDuelist = async (guild: string, user: string) => {
  const duelist = await findUser(guild, user);

  return {
    attack: duelist?.attack || 15,
    defense: duelist?.defense || 15,
    health: duelist?.health || 100,
    id: duelist?._id || '',
    level: duelist?.level || 1,
    luck: duelist?.luck || 1,
    name: duelist?.username || 'Duelist'
  };
};

export const getResults = async (attacker: Duelist, defender: Duelist, channel: TextChannel) => {
  const winner = defender.health > 0 ? defender : attacker;
  const loser = defender.health > 0 ? attacker : defender;
  const experience = Math.max(1, Math.floor((loser.level * 2) / winner.level));

  addRole(
    channel.guild.roles.cache.array(),
    channel.guild.members.cache.array(),
    BOSSES.find((b) => defender.id.toLowerCase().includes(b)) || '',
    winner.id
  );

  getBuffs(
    winner,
    experience,
    winner === attacker,
    winner.level + winner.attack + winner.defense < loser.level + loser.attack + loser.defense,
    channel
  );

  getDeBuffs(loser, channel);
};

export const resetPlayer = async (guild: string, user: string) => {
  const doc = await findUser(guild, user);

  if (!doc) return;

  doc.attack = 15;
  doc.defense = 15;
  doc.health = 100;
  doc.level = 1;
  doc.luck = 1;
  doc.losses = 0;
  doc.wins = 0;
  doc.messages = 0;

  saveDoc(doc, guild, user);
};
