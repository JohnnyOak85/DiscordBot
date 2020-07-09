module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
                await commandHelper.removeRole(role);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}