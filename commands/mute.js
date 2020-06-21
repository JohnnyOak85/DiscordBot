module.exports = {
    name: 'mute',
    description: 'Mute a user.  Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of minutes>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
                await commandHelper.addRole(role)
                await commandHelper.startTimer('muted', args[1], 'minutes');
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}