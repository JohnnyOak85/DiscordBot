import { TextChannel } from 'discord.js';

import { findUser } from '../member.helper';
import { saveDoc } from '../tools/database.helper';
import { buildEmbed } from '../tools/embed.helper';
import { getBool, getRandom, increment } from '../tools/utils.helper';
import { addRole, upgradeRole } from '../roles.helper';

import { Duelist } from '../../interfaces';
import { BOSSES } from '../../game-config.json';

const getLuckBoost = (player: Duelist, reply: string) => {
  player.luck = player.luck + 1;
  reply = `${reply} +1 luck.`;

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
    channel.send(`${reply}**`);
  }

  recordWinner(winner, channel.guild.id);
};

const recordWinner = async (winner: Duelist, guild: string) => {
  const doc = await findUser(guild, winner.id);

  if (!doc) return;

  winner.health = winner.health < (doc?.health || 100) ? doc?.health || 100 : winner.health;

  doc.wins = (doc?.wins || 0) + 1;

  saveDoc(Object.assign(doc, winner), guild, winner.id);
};

const recordLoser = async (loser: Duelist, guild: string) => {
  const doc = await findUser(guild, loser.id);

  if (!doc) return;

  loser.health = loser.health < (doc?.health || 100) ? doc?.health || 100 : loser.health;

  doc.losses = (doc?.losses || 0) + 1;

  saveDoc(Object.assign(doc, loser), guild, loser.id);
};

export const getBuffs = (player: Duelist, experience: number, attacker: boolean, adversary: Duelist, channel: TextChannel) => {
  if (player.id.includes('_') || isNaN(parseInt(player.id, 10))) return;

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

  if (player.level + player.attack + player.defense < adversary.level + adversary.attack + adversary.defense) {
    reply = getLuckBoost(player, reply);
  }

  if (BOSSES.find((b) => adversary.name.toLowerCase().includes(b)) && !player.bestiary.includes(adversary.name)) {
    addRole(channel.guild.roles.cache.array(), channel.guild.members.cache.array(), adversary.name.toLowerCase(), player.id);

    reply = `${reply}\nYou just defeated **${adversary.name}**! Congratulations!`;
  }

  if (!player.bestiary.includes(adversary.name)) {
    player.bestiary.push(adversary.name);
  }

  levelUp(player, channel, reply);
};

export const getDeBuffs = (player: Duelist, channel: TextChannel) => {
  if (player.id.includes('_') || isNaN(parseInt(player.id, 10))) return;

  let deBuffs = '';

  const attackDeBuff = getBool() ? 1 : 2;
  const defenseDeBuff = getBool() ? 1 : 2;

  player.attack = player.attack - attackDeBuff;
  player.defense = player.defense - defenseDeBuff;

  if (player.attack <= 15) {
    player.attack = 15;
  } else {
    deBuffs = `${deBuffs}-${attackDeBuff} attack.`;
  }

  if (player.defense <= 15) {
    player.defense = 15;
  } else {
    deBuffs = `${deBuffs} -${defenseDeBuff} defense.`;
  }

  channel.send(`**${player.name}** lost!\n**${deBuffs}**`);

  recordLoser(player, channel.guild.id);
};
