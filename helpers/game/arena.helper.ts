import { TextChannel } from 'discord.js';

import { ensureDuelist, startRounds } from './duel.helper';
// import { recordDocChanges } from '../storage.helper';
import { addStage, deleteStage, getStage } from './stage.helper';
import { buildEmbed } from '../embed.helper';

import { Player } from './interfaces';

const activeDuel = {
  challenger: '',
  defender: ''
};

export const acceptChallenge = async (channel: TextChannel, defenderId: string) => {
  try {
    if (getStage(channel.name) || !activeDuel.challenger || activeDuel.defender !== defenderId) return;

    const challenger = await ensureDuelist(`${channel.guild.name}/${activeDuel.challenger}`);
    const defender = await ensureDuelist(`${channel.guild.name}/${activeDuel.defender}`);

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
    }, 300000);

    addStage(channel.name, timer);
  } catch (error) {
    throw error;
  }
};
