import { Message } from 'discord.js';

import { StoryFactory } from '../factories/story.factory';
import { logError } from '../helpers/tools/utils.helper';

module.exports = {
  name: 'story',
  description: 'Get a random story',
  usage: '<user>',
  moderation: false,
  game: false,
  execute: async (message: Message) => {
    try {
      message.mentions.members?.array()[0]
        ? message.channel.send(
            await new StoryFactory(
              message.mentions.members?.array()[0].nickname || message.mentions.members?.array()[0].displayName
            ).getStory()
          )
        : undefined;
    } catch (error) {
      logError(error);
    }
  }
};
