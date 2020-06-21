module.exports = {
    name: 'ban',
    description: 'Ban a user. Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of days> <reason>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
                await commandHelper.addInfractor('banned');
                await commandHelper.startTimer('banned', args[1], 'days');
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}