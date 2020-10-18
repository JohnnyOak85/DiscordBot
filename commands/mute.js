module.exports = {
    name: 'mute',
    description: `Mention a user and that user won't be able to send messages. Can be temporary if provided with a number between 1 and 100.`,
    usage: '<user> <number of minutes> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.giveStrike();
                    await commandHelper.addRole('muted');
                    commandHelper.startTimer(args[1], 'minutes');
                    await commandHelper.saveList();
                };
            }

            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}