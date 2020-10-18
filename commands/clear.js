const { checkMember } = require("../helpers/command.helper");

module.exports = {
    name: 'clear',
    description: 'Clear a set amount of lines from 1 to 100.',
    usage: '<number of lines>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
                const amount = commandHelper.getNumber(args[0]);

                if (!amount) {
                    await commandHelper.sendReply(message.guild, 'I need a number from 1 to 100.');
                    return;
                }

                await commandHelper.deleteMessages(message.channel, amount);
            }
        } catch (error) {
            throw error
        }
    }
}