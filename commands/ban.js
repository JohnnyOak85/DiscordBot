module.exports = {
    name: 'ban',
    description: 'Ban a member',
    async execute(message, args, commandHelper) {
        let infractor;

        commandHelper.start(message, args);

        if (commandHelper.verifyUser('BAN_MEMBERS')) infractor = await commandHelper.getInfractor();

        if (infractor) {
            // infractor.ban().catch(error => { throw error });
            commandHelper.addInfractor('banned');
        };

        message.channel.send(commandHelper.getReply());
    }
}