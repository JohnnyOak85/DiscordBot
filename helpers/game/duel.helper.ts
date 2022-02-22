import { TextChannel } from 'discord.js';

import { getUserDoc } from '../storage.helper';
import { getBool, getRandom } from '../utils.helper';

import { Monster, Player } from './interfaces';

export const ensureDuelist = async (path: string) => {
  const duelist = await getUserDoc(path);

  if (!duelist) return;

  return {
    attack: duelist.attack || 15,
    defense: duelist.defense || 15,
    health: duelist.health || 100,
    id: duelist._id || '',
    level: duelist.level || 1,
    name: duelist.username || 'Duelist'
  };
};

// TODO Use another attribute to determine this stat or a bigger window.
const getBoost = (attribute: number, boost: number) => {
  switch (true) {
    case boost < 21:
      return 0;
    case boost > 80:
      return attribute * 2;
    default:
      return attribute;
  }
};

const battle = (attacker: Player | Monster, defender: Player | Monster, channel: TextChannel) => {
  try {
    const damage = Math.max(0, getBoost(attacker.attack, getRandom(100)) - getBoost(defender.defense, getRandom(100)));

    if (damage > 0) {
      defender.health = Math.max(0, defender.health - damage);
      channel.send(`${attacker.name} attacks! ${damage} damage!`);
      channel.send(`${defender.name} has ${defender.health} health.`);
    } else {
      channel.send(`${attacker.name} missed!`);
    }

    if (getBool()) {
      attacker.health = Math.max(0, attacker.health - defender.attack);
      channel.send(`${defender.name} counters! ${defender.attack} damage!`);
      channel.send(`${attacker.name} has ${attacker.health} health.`);
    } else if (getBool() && damage !== 0) {
      channel.send(`${attacker.name} follows through!`);

      return { boutWinner: attacker, boutLoser: defender };
    }

    return { boutWinner: defender, boutLoser: attacker };
  } catch (error) {
    throw error;
  }
};

const getWinner = (attacker: Player | Monster, defender: Player | Monster, channel: TextChannel) => {
  const winner = defender.health > 0 ? defender : attacker;
  const loser = defender.health > 0 ? attacker : defender;
  const experience = Math.max(1, Math.floor((loser.level * 2) / winner.level));
  const split = getRandom(experience);

  channel.send(`${winner.name} wins!`);

  if (winner === attacker) {
    const bigSplit = split > Math.max(1, experience / 2);
    const attackBoost = bigSplit ? split : Math.max(1, experience - split);
    const defenseBoost = bigSplit ? Math.max(1, experience - split) : split;

    winner.attack = attackBoost;
    winner.defense = defenseBoost;

    channel.send(`+${attackBoost} attack points.`);
    channel.send(`+${defenseBoost} defense points.`);
  } else if (winner === defender) {
    const bigSplit = split > experience / 2;
    const attackBoost = bigSplit ? Math.max(1, experience - split) : split;
    const defenseBoost = bigSplit ? split : Math.max(1, experience - split);

    winner.attack = attackBoost;
    winner.defense = defenseBoost;

    channel.send(`+${attackBoost} attack points.`);
    channel.send(`+${defenseBoost} defense points.`);
  }

  return winner;
};

export const startRounds = (challenger: Player | Monster, challenged: Player | Monster, channel: TextChannel) => {
  let attacker = challenger;
  let defender = challenged;

  while (challenged.health > 0 && challenger.health > 0) {
    const roundResult = battle(attacker, defender, channel);

    attacker = roundResult.boutWinner;
    defender = roundResult.boutLoser;
  }

  return getWinner(challenger, challenged, channel);
};
