module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
            if (commandHelper.checkMember()) {
                await commandHelper.removeRole('muted')
                    .catch(err => { throw err; });
                await commandHelper.saveDoc();
            };
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}