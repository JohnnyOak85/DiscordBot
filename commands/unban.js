module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<username>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'BAN_MEMBERS')) {
                await commandHelper.unbanMember(args[0]);
                await commandHelper.saveList();
            }

            await commandHelper.sendReply(message.guild.systemChannel, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}