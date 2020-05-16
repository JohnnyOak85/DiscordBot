module.exports = {
    name: 'kick',
    description: 'Kick a member',
    async execute(message, args, commandHelper) {
        let infractor;

        commandHelper.start(message, args);

        if (commandHelper.verifyUser('KICK_MEMBERS')) infractor = await commandHelper.getInfractor();

        if (infractor) {
            infractor.kick().catch(error => { throw error });
            commandHelper.addInfractor('kicked');
        };

        message.channel.send(commandHelper.getReply());
    }
}