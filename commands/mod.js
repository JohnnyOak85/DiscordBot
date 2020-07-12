module.exports = {
    name: 'mod',
    description: 'Mention a user and that user will be awarded with the moderator role.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'ADMINISTRATOR')) {
            if (commandHelper.checkMember()) {
                await commandHelper.addRole('moderator')
                    .catch(err => { throw err; });
                await commandHelper.saveDoc();
            }
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}