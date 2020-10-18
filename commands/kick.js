module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(member, 'KICK_MEMBERS')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.giveStrike()
                    await commandHelper.kickMember()
                    await commandHelper.saveList();
                };
            }

            await commandHelper.sendReply(guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}