module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<username>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'BAN_MEMBERS')) {
            commandHelper.unbanMember(args[0])
                .catch(err => { throw err; });
            await commandHelper.saveList();
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}