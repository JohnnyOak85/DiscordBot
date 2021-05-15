// Discord
import { Message } from 'discord.js';

// Helpers
import { setRules } from '../helpers/channels.helper';
import { getNumber } from '../helpers/utils.helper';

// Configurations
import { RULE_LIST } from '../config.json';

module.exports = {
  name: 'unrule',
  description: `Removes a rule from the rules list by it's position.`,
  usage: '<position>',
  moderation: true,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      const channel = message.guild?.systemChannel;
      const index = getNumber(args[0]);

      if (!message.member?.hasPermission('ADMINISTRATOR')) {
        message.channel.send('You do not have permission for this command.');
        return;
      }

      if (!channel) {
        message.guild?.systemChannel?.send(`I don't seem to have a rules channel!`);
        return;
      }

      if (!index) {
        message.channel.send('Please input a number.');
        return;
      }

      RULE_LIST.splice(index + 1, 1);

      setRules(channel, RULE_LIST);
    } catch (error) {
      throw error;
    }
  }
};
