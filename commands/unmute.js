module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.removeRole('muted')
                    await commandHelper.saveList();
                };
            }

            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}