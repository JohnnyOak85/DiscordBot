module.exports = {
    name: 'ban',
    description: 'Mention a user and that user will be banned from the server. Can be temporary if provided with a number between 1 and 100.',
    usage: '<user> <number of days> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'BAN_MEMBERS')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.giveStrike()
                    await commandHelper.banMember()
                    list = commandHelper.startTimer(list, args[1], 'days');
                    await commandHelper.saveList();
                };
            }
            
            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}