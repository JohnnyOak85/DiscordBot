import { TextChannel } from 'discord.js';

import { findUser } from '../member.helper';
import { getRandom, increment } from '../tools/utils.helper';
import { saveDoc } from '../tools/database.helper';

import { Duelist } from '../../interfaces';
import { control } from '../../game-config.json';
import { buildEmbed } from '../tools/embed.helper';

const recordWinner = async (winner: Duelist, guild: string) => {
  const doc = await findUser(guild, winner.id);

  winner.health = doc?.health || 100;

  saveDoc(Object.assign(doc, winner), guild, winner.id);
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

const getBoost = (attribute: number, boost: number) => {
  if (boost < 21) {
    return 0;
  } else if (boost > 80) {
    return attribute * 2;
  }

  return attribute;
};

const battle = (attacker: Duelist, defender: Duelist, channel: TextChannel) => {
  try {
    const damageBoost = getBoost(attacker.attack, getRandom());
    const defenseBoost = getBoost(defender.defense, getRandom());
    const damage = Math.floor(Math.max(0, damageBoost * (control / (control + defenseBoost))));

    if (!damageBoost) {
      channel.send(`${attacker.name} missed!`);
    } else if (!damage) {
      channel.send(`${defender.name} defended!`);
    } else {
      defender.health = Math.max(0, defender.health - damage);
      channel.send(`${attacker.name} attacks! ${damage} damage! ${defender.name} has ${defender.health} health.`);
    }

    if (defender.health <= 0) {
      return { boutWinner: defender, boutLoser: attacker };
    }

    if (getRandom(defender.luck) >= 50) {
      attacker.health = Math.max(0, attacker.health - defender.attack);
      channel.send(`${defender.name} counters! ${defender.attack} damage! ${attacker.name} has ${attacker.health} health.`);
    } else if (getRandom(attacker.luck) >= 50 && damageBoost) {
      channel.send(`${attacker.name} follows through!`);

      return { boutWinner: attacker, boutLoser: defender };
    }

    return { boutWinner: defender, boutLoser: attacker };
  } catch (error) {
    throw error;
  }
};

const getWinner = (attacker: Duelist, defender: Duelist, channel: TextChannel) => {
  const winner = defender.health > 0 ? defender : attacker;
  const loser = defender.health > 0 ? attacker : defender;
  const experience = Math.max(1, Math.floor((loser.level * 2) / winner.level));
  const split = getRandom(experience);

  channel.send(`${winner.name} wins!`);

  let attackBoost;
  let defenseBoost;

  if (winner === attacker) {
    const bigSplit = split > Math.max(1, experience / 2);
    attackBoost = bigSplit ? split : Math.max(1, experience - split);
    defenseBoost = bigSplit ? Math.max(1, experience - split) : split;

    winner.attack = attackBoost;
    winner.defense = defenseBoost;
  } else if (winner === defender) {
    const bigSplit = split > experience / 2;
    attackBoost = bigSplit ? Math.max(1, experience - split) : split;
    defenseBoost = bigSplit ? split : Math.max(1, experience - split);

    winner.attack = attackBoost;
    winner.defense = defenseBoost;
  }

  if (winner.id.includes('_')) return;

  const currentLevel = winner.level;

  winner.level = increment(winner.attack + winner.defense, winner.level);

  channel.send(`+${attackBoost} attack. +${defenseBoost} defense.`);

  if (winner.level > currentLevel) {
    const embed = buildEmbed({ description: `<@${winner.id}>\n${currentLevel} -> ${winner.level}`, title: 'Level up!' });

    channel.guild.systemChannel?.send(embed);
  }

  recordWinner(winner, channel.guild.id);
};

export const startRounds = (challenger: Duelist, challenged: Duelist, channel: TextChannel) => {
  let attacker = challenger;
  let defender = challenged;

  while (challenged.health > 0 && challenger.health > 0) {
    const roundResult = battle(attacker, defender, channel);

    attacker = roundResult.boutWinner;
    defender = roundResult.boutLoser;
  }

  getWinner(challenger, challenged, channel);
};
