module.exports = {
    name: 'mute',
    description: 'Mute a member',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
                if (await commandHelper.addRole(role)) {
                    await commandHelper.setTimer('muted', 'minutes');
                }
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}