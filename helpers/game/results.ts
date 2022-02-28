import { TextChannel } from 'discord.js';

import { findUser } from '../member.helper';
import { saveDoc } from '../tools/database.helper';
import { buildEmbed } from '../tools/embed.helper';
import { getBool, getRandom, increment } from '../tools/utils.helper';

import { Duelist } from '../../interfaces';
import { upgradeRole } from '../roles.helper';

const getLuckBoost = (player: Duelist, reply: string, lucky: boolean) => {
  if (lucky) {
    player.luck = player.luck + 1;
    reply = `${reply} +1 luck.`;
  }

  return reply;
};

const levelUp = async (winner: Duelist, channel: TextChannel, reply: string) => {
  const currentLevel = winner.level;

  if (!reply || currentLevel >= 50) return;

  winner.level = increment(winner.attack + winner.defense, winner.level);

  if (winner.level > currentLevel) {
    const gain = getRandom(winner.level * 4, winner.level);
    const doc = await findUser(channel.guild.id, winner.id);

    winner.health = (doc?.health || 100) + gain;

    reply = `<@${winner.id}>\n**${currentLevel} -> ${winner.level}**\n${reply} +${gain} health.**`;

    const upgrade = await upgradeRole(channel.guild.members.cache.array(), winner.id, winner.level);

    if (upgrade) {
      reply = `${reply}\n**Rank up! -> ${upgrade}!**`;
    }

    const embed = buildEmbed({
      description: reply,
      title: 'Level up!'
    });

    channel.send(embed);
  } else {
    channel.send(reply);
  }

  recordWinner(winner, channel.guild.id);
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

  if (!doc) return;

  doc.losses = (doc?.losses || 0) + 1;

  saveDoc(doc, guild, loser.id);
};

export const getBuffs = (player: Duelist, experience: number, attacker: boolean, lucky: boolean, channel: TextChannel) => {
  if (player.id.includes('_')) return;

  const split = getRandom(experience);
  let reply = `**${player.name}** wins!`;
  let attackBoost = 0;
  let defenseBoost = 0;

  if (attacker) {
    const bigSplit = split > Math.max(1, experience / 2);

    attackBoost = bigSplit ? split : Math.max(1, experience - split);
    defenseBoost = bigSplit ? Math.max(1, experience - split) : split;
  } else {
    const bigSplit = split > experience / 2;

    attackBoost = bigSplit ? Math.max(1, experience - split) : split;
    defenseBoost = bigSplit ? split : Math.max(1, experience - split);
  }

  player.attack = player.attack + attackBoost;
  player.defense = player.defense + defenseBoost;

  reply = `${reply}\n**+${attackBoost} attack. +${defenseBoost} defense.`;
  reply = getLuckBoost(player, reply, lucky);

  levelUp(player, channel, reply);
};

export const getDeBuffs = (player: Duelist, channel: TextChannel) => {
  if (player.id.includes('_')) return;

  player.attack = getBool() ? player.attack - 1 : player.attack - 2;
  player.defense = getBool() ? player.defense - 1 : player.defense - 2;

  recordLoser(player, channel.guild.id);
};
