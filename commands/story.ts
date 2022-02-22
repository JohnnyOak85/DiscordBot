import { Message } from 'discord.js';

import { StoryFactory } from '../factories/story.factory';

module.exports = {
  name: 'story',
  description: 'Get a random story',
  usage: '<user>',
  moderation: false,
  execute: async (message: Message) => {
    try {
      const user = message.mentions.members?.array()[0];

      if (!user) return;

      const storyFactory = new StoryFactory(user.nickname || user.displayName);

      message.channel.send(await storyFactory.getStory());
    } catch (error) {
      throw error;
    }
  }
};
