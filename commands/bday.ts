// Discord
import { Message } from 'discord.js';

// Helpers
import { addUserAnniversary } from '../helpers/member.helper';

module.exports = {
  name: 'bday',
  description: 'Adds a birthday date to be celebrated.',
  usage: '<user> <MM-DD-YYYY>',
  moderation: false,
  execute: async (message: Message, args: string[]): Promise<void> => {
    try {
      const member = message.mentions.members?.array()[0];

      if (!member) {
        message.channel.send('You need to mention a valid user.');
        return;
      }

      const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])-(19|20)\d{2}$/;
      const dateString = args.slice(1)[0];

      if (!dateRegex.test(dateString)) {
        message.channel.send('Invalid date!');
        return;
      }

      const date = new Date(args.slice(1)[0]);

      if (isNaN(date.getTime())) {
        message.channel.send(`${date}!`);
        return;
      }

      const reply = await addUserAnniversary(member, date);

      if (!reply) return;

      message.guild?.systemChannel?.send(reply);
    } catch (error) {
      throw error;
    }
  }
};
