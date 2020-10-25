const { start, verifyUser, getNumber, sendReply, deleteMessages } = require("../helpers/command.helper");

module.exports = {
    name: 'clear',
    description: 'Clear a set amount of lines from 1 to 100.',
    usage: '<number of lines>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                const amount = getNumber(args[0]);

                if (!amount) {
                    await sendReply(message.channel, 'I need a number from 1 to 100.');
                    return;
                }

                await deleteMessages(message.channel, amount);
            }
        } catch (error) {
            throw error
        }
    }
}