import { TextChannel } from 'discord.js';

import { findUser } from '../member.helper';
import { saveDoc } from '../tools/database.helper';
import { buildEmbed } from '../tools/embed.helper';
import { getRandom, increment } from '../tools/utils.helper';

import { Duelist } from '../../interfaces';

export const getStats = async (guild: string, user: string) => {
  const player = await findUser(guild, user);

  return `\nLevel: ${player?.level}\nHealth: ${player?.health}\nAttack: ${player?.attack}\nDefense: ${player?.defense}\nLuck: ${player?.luck}`;
};

export const ensureDuelist = async (guild: string, user: string) => {
  const duelist = await findUser(guild, user);

  return duelist
    ? {
        attack: duelist.attack || 15,
        defense: duelist.defense || 15,
        health: duelist.health || 100,
        id: duelist._id || '',
        level: duelist.level || 1,
        luck: duelist.luck || 1,
        name: duelist.username || 'Duelist'
      }
    : undefined;
};

const recordWinner = async (winner: Duelist, guild: string) => {
  const doc = await findUser(guild, winner.id);

  winner.health = winner.health < (doc?.health || 100) ? doc?.health || 100 : winner.health;

  if (doc) {
    doc.wins = (doc?.wins || 0) + 1;
  }

  saveDoc(Object.assign(doc, winner), guild, winner.id);
};

const recordLoser = async (loser: Duelist, guild: string) => {
  const doc = await findUser(guild, loser.id);

  if (doc) {
    doc.losses = (doc?.losses || 0) + 1;
  }

  saveDoc(doc, guild, loser.id);
};

const levelUp = async (winner: Duelist, guild: string) => {
  const currentLevel = winner.level;

  winner.level = increment(winner.attack + winner.defense, winner.level);

  if (winner.level > currentLevel) {
    const gain = getRandom(winner.level * 4, winner.level);

    const doc = await findUser(guild, winner.id);

    winner.health = (doc?.health || 100) + gain;

    return `<@${winner.id}>\n**${currentLevel}** -> **${winner.level}**\n**+${gain} health.`;
  }
};

export const getWinner = async (attacker: Duelist, defender: Duelist, channel: TextChannel) => {
  const winner = defender.health > 0 ? defender : attacker;
  const loser = defender.health > 0 ? attacker : defender;
  const experience = Math.max(1, Math.floor((loser.level * 2) / winner.level));
  const split = getRandom(experience);

  channel.send(`**${winner.name}** wins!`);

  let attackBoost = 0;
  let defenseBoost = 0;

  if (winner === attacker) {
    const bigSplit = split > Math.max(1, experience / 2);

    attackBoost = bigSplit ? split : Math.max(1, experience - split);
    defenseBoost = bigSplit ? Math.max(1, experience - split) : split;
  } else if (winner === defender) {
    const bigSplit = split > experience / 2;

    attackBoost = bigSplit ? Math.max(1, experience - split) : split;
    defenseBoost = bigSplit ? split : Math.max(1, experience - split);
  }

  winner.attack = winner.attack + attackBoost;
  winner.defense = winner.defense + defenseBoost;

  if (winner.id.includes('_')) return;

  const levelled = await levelUp(winner, channel.guild.id);
  let reply = `+${attackBoost} attack. +${defenseBoost} defense.`;

  if (winner.level + winner.attack + winner.defense < loser.level + loser.attack + loser.defense) {
    winner.luck = winner.luck + 1;
    reply = `${reply} +1 luck.`;
  }

  if (levelled) {
    const embed = buildEmbed({
      description: `${levelled} ${reply}**`,
      title: 'Level up!'
    });

    channel.send(embed);
  } else {
    channel.send(`**${reply}**`);
  }

  recordWinner(winner, channel.guild.id);
  recordLoser(loser, channel.guild.id);
};
