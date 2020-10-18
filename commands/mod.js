module.exports = {
    name: 'mod',
    description: 'Mention a user and that user will be awarded with the moderator role.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'ADMINISTRATOR')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.addRole('moderator')
                    await commandHelper.saveList();
                }
            }

            await commandHelper.sendReply(message.guild.systemChannel, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}