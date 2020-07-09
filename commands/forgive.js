module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = commandHelper.getInfractor();
            if (infractor) {
                await commandHelper.removeStrike();
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}