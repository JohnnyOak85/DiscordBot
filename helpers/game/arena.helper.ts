import { TextChannel } from 'discord.js';

import { ensureDuelist, startRounds } from './duel.helper';
// import { recordDocChanges } from '../storage.helper';
import { addStage, deleteStage, findStage } from './stage.helper';
import { buildEmbed } from '../embed.helper';

import { Player } from './interfaces';

const activeDuel = {
  challenger: '',
  defender: ''
};

export const acceptChallenge = async (channel: TextChannel, defenderId: string) => {
  try {
    if (activeDuel.defender !== defenderId) {
      channel.send(`<@${defenderId}> there are no open challenges for you.`);
      return;
    }

    if (!findStage(channel.name) || !activeDuel.challenger) return;

    const challenger = await ensureDuelist(`${channel.guild.id}/${activeDuel.challenger}`);
    const defender = await ensureDuelist(`${channel.guild.id}/${activeDuel.defender}`);

    if (!challenger || !defender) return;

    const winner = startRounds(challenger, defender, channel) as Player;

    // recordDocChanges(winner, `${channel.guild.name}/${winner.id}`);

    deleteStage(channel.name);
  } catch (error) {
    throw error;
  }
};

export const issueChallenge = async (channel: TextChannel, challenger: string, defender: string) => {
  try {
    activeDuel.challenger = challenger;
    activeDuel.defender = defender;

    const embed = buildEmbed(
      { description: `<@${challenger}> has challenged <@${defender}>!`, title: '**CHALLENGE ISSUED**' },
      '#ff2050'
    );

    channel.send(embed);

    const timer = setTimeout(() => {
      deleteStage(channel.name);
      channel.send(`<@${challenger}>'s challenge has expired!`);
    }, 300000);

    addStage(channel.name, timer);
  } catch (error) {
    throw error;
  }
};
