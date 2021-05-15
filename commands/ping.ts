import { Message } from 'discord.js';

module.exports = {
  name: 'ping',
  description: 'Check if the bot is on',
  usage: '<command>',
  moderation: false,
  execute: async (message: Message): Promise<void> => {
    try {
      message.reply('Pong!');
    } catch (error) {
      throw error;
    }
  }
};
