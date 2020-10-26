const { verifyPermission } = require('../helpers/member.helper');

module.exports = {
    name: 'clear',
    description: 'Clear a set amount of lines from 1 to 100.',
    usage: '<number of lines>',
    moderation: true,
    async execute(message, args) {
        try {
            if (await verifyPermission(message.member, 'MANAGE_MESSAGES', message.channel)) {
                const amount = parseInt(args[0]);

                if (amount < 0 || amount > 100 || isNaN(amount)) {
                    await message.channel.send('I need a number from 1 to 100.');
                    return;
                }

                await message.channel.bulkDelete(amount + 1, true);
                return;
            }
        } catch (error) {
            throw error
        }
    }
}