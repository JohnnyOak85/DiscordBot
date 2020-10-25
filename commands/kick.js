const { start, verifyUser, checkMember, giveStrike, kickMember, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(member, 'KICK_MEMBERS')) {
                if (checkMember()) {
                    await giveStrike()
                    await kickMember()
                    await saveList();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}