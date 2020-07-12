module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'KICK_MEMBERS')) {
            if (commandHelper.checkMember()) {
                await commandHelper.giveStrike()
                    .catch(error => { throw error });
                await commandHelper.kickMember()
                    .catch(error => { throw error });
                await commandHelper.saveDoc();
            };
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}