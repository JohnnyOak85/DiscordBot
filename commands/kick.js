module.exports = {
    name: 'kick',
    description: 'Kick a user.',
    usage: '<user> <reason>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('KICK_MEMBERS')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await infractor.kick(commandHelper.getReason()).catch(error => { throw error });
                commandHelper.setReply(`${infractor.user.username} has been kicked for ${commandHelper.getReason()}`)
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}