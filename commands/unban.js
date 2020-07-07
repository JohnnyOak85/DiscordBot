module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            commandHelper.setReply('You need to mention a valid user!');
            const bannedList = await commandHelper.fetchBans();
            if (bannedList) {
                const infractor = bannedList.array().find(i => i.user.username.includes(args[0]));
                if (infractor) {
                    commandHelper.setInfractor(infractor);
                    commandHelper.unban(infractor);
                    commandHelper.setReply(`${infractor.username} is no longer banned.`);
                }
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}