import { Message } from 'discord.js';

import { issueChallenge } from '../helpers/game/arena.helper';

import { ARENA } from '../config.json';

module.exports = {
  name: 'challenge',
  description: 'Challenge another user to combat! Only works in the arena channel.',
  usage: '<user>',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const mentions = message.mentions.members?.array();

      if (!mentions || message.channel.type !== 'text' || message.channel.name !== ARENA) return;

      issueChallenge(message.channel, message.author.id, mentions[0].id);
    } catch (error) {
      throw error;
    }
  }
};
