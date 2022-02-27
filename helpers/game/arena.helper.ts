import { TextChannel } from 'discord.js';

import { startRounds } from './duel.helper';
import { CollectionFactory } from '../../factories/collection.factory';
import { buildEmbed } from '../tools/embed.helper';
import { ensureDuelist } from './player';
import { getBool } from '../tools/utils.helper';

const duels = new CollectionFactory<{
  challenger: string;
  timer: NodeJS.Timeout;
}>();

const cleanUpDuel = (name: string) => {
  const timer = duels.getItem(name)?.timer;

  if (timer) duels.clearTimer(name, timer);
};

export const acceptChallenge = async (channel: TextChannel, defenderId: string) => {
  try {
    const duel = duels.getItem(defenderId);
    let attacker;
    let defender;

    if (!duel) {
      channel.send(`<@${defenderId}> there are no open challenges for you.`);
      return;
    }

    if (getBool()) {
      attacker = await ensureDuelist(channel.guild.id, duel.challenger);
      defender = await ensureDuelist(channel.guild.id, defenderId);
    } else {
      attacker = await ensureDuelist(channel.guild.id, defenderId);
      defender = await ensureDuelist(channel.guild.id, duel.challenger);
    }

    if (!attacker || !defender) return;

    startRounds(attacker, defender, channel);

    cleanUpDuel(defenderId);
  } catch (error) {
    throw error;
  }
};

export const issueChallenge = async (channel: TextChannel, challenger: string, defender: string) => {
  try {
    if (duels.findItem(defender) || duels.getList().find((item) => item.challenger === defender)) {
      channel.send('This fighter already has an open challenge.');
      return;
    } else if (duels.findItem(challenger) || duels.getList().find((item) => item.challenger === challenger)) {
      channel.send('You already have an open challenge.');
      return;
    }

    channel.send(
      buildEmbed({
        color: '#ff2050',
        description: `<@${challenger}> has challenged <@${defender}>!`,
        title: '**CHALLENGE ISSUED**'
      })
    );

    duels.addItem(defender, {
      challenger,
      timer: setTimeout(() => {
        duels.deleteItem(defender);
        channel.send(`<@${challenger}>'s challenge has expired!`);
      }, 300000)
    });
  } catch (error) {
    throw error;
  }
};
