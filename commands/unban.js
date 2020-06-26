module.exports = {
    name: 'unban',
    description: `Unban a user.`,
    usage: '<user>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            commandHelper.setReply('You need to mention a valid user!');
            const bannedList = await commandHelper.fetchBans();
            if (bannedList) {
                const infractor = bannedList.array().find(i => i.user.username.includes(args[0]));
                if (infractor) {
                    commandHelper.setInfractor(infractor.user);
                    const guild = commandHelper.getGuild();
                    await guild.members.unban(infractor.user.id).catch(error => { throw error });
                    commandHelper.removeInfractor('banned');
                }
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}