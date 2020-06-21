module.exports = {
    name: 'forgive',
    description: 'Removes the oldest infraction a user has.',
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = commandHelper.getInfractor();
            if (infractor) {
                await commandHelper.removeInfraction('warned');
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}