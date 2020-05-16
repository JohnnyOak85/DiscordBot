module.exports = {
    name: 'mute',
    description: 'Mute a member',
    async execute(message, args, commandHelper) {
        let role = 'Muted';
        let infractor;

        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) infractor = await commandHelper.getInfractor();

        if (infractor) {
            if (await commandHelper.addRole(role)) {
                role = role.toLowerCase();
                await commandHelper.removeInfractor(role.toLowerCase());
                await commandHelper.addInfractor(role.toLowerCase());
                await commandHelper.setTimer(role);
            }
        };

        message.channel.send(commandHelper.getReply());
    }
}