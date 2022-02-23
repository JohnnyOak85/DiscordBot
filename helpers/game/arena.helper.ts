import { TextChannel } from 'discord.js';

import { ensureDuelist, startRounds } from './duel.helper';
import { CollectionFactory } from '../../factories/collection.factory';
import { buildEmbed } from '../embed.helper';

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

    if (!duel) {
      channel.send(`<@${defenderId}> there are no open challenges for you.`);
      return;
    }

    const challenger = await ensureDuelist(channel.guild.id, duel.challenger);
    const defender = await ensureDuelist(channel.guild.id, defenderId);

    if (!challenger || !defender) return;

    startRounds(challenger, defender, channel);

    cleanUpDuel(defenderId);
  } catch (error) {
    throw error;
  }
};

export const issueChallenge = async (channel: TextChannel, challenger: string, defender: string) => {
  try {
    if (duels.findItem(defender)) {
      channel.send('This fighter already has an open challenge.');
      return;
    }

    const embed = buildEmbed(
      { description: `<@${challenger}> has challenged <@${defender}>!`, title: '**CHALLENGE ISSUED**' },
      '#ff2050'
    );

    channel.send(embed);

    const timer = setTimeout(() => {
      duels.deleteItem(defender);
      channel.send(`<@${challenger}>'s challenge has expired!`);
    }, 300000);

    duels.addItem(defender, { challenger, timer });
  } catch (error) {
    throw error;
  }
};
