module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (commandHelper.checkMember()) {
                    commandHelper.removeStrike();
                    await commandHelper.saveList();
                }
            }

            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}