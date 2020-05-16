module.exports = {
    name: 'ban',
    description: 'Ban a member',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
                commandHelper.addInfractor('banned');
                await commandHelper.setTimer('banned', 'days');
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}