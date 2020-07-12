module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
            if (commandHelper.checkMember()) {
                await commandHelper.removeStrike();
            }
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}