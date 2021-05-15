// Discord
import { Message } from 'discord.js';

// Helpers
import { setRules } from '../helpers/channels.helper';

// Configurations
import { RULE_LIST } from '../config.json';

module.exports = {
  name: 'rule',
  description: 'Adds a new rule to the rules list.',
  usage: '<rule>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      if (!message.member?.hasPermission('ADMINISTRATOR')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      const channel = message.guild?.systemChannel;

      if (!channel) message.guild?.systemChannel?.send(`I don't seem to have a rules channel!`);

      RULE_LIST.push(args[0]);

      setRules(channel, RULE_LIST);
    } catch (error) {
      throw error;
    }
  }
};
