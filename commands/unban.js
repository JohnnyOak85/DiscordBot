const { start, verifyUser, unbanMember, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'unban',
    description: `Provide a username and that user will have access to the server again.`,
    usage: '<username>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'BAN_MEMBERS')) {
                await unbanMember(args[0]);
                await saveList();
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}