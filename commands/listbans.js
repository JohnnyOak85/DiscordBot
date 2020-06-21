module.exports = {
    name: 'listbans',
    description: 'Lists all the users that have been banned.',
    usage: ' ',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('BAN_MEMBERS')) {
            const bannedList = await commandHelper.fetchBans();
            if (bannedList) {
                let message = '';
                bannedList.array().forEach(i => {
                    let reason = 'No reason provided';
                    if (i.reason) reason = i.reason;
                    message += `<@!${i.user.id}> ${reason}\n`
                })
                commandHelper.setReply(message);
            }
        }
        message.channel.send(commandHelper.getReply());
    }
}