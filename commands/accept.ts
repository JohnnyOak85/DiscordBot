import { Message } from 'discord.js';

import { acceptChallenge } from '../helpers/game/arena.helper';

import { ARENA } from '../config.json';

module.exports = {
  name: 'accept',
  description: 'Accept a challenge another user issued. Only works in the arena channel.',
  usage: ' ',
  moderation: false,
  execute: async (message: Message) => {
    try {
      if (message.channel.type !== 'text' || message.channel.name !== ARENA) return;

      acceptChallenge(message.channel, message.author.id);
    } catch (error) {
      throw error;
    }
  }
};
