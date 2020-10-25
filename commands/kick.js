const { verifyUser, checkMember, issueStrike, kickMember, saveMembers, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'kick',
    description: 'Mention a user and that user gets removed from the server.',
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyUser(member, 'KICK_MEMBERS')) {
                if (checkMember()) {
                    await issueStrike()
                    await kickMember()
                    await saveMembers();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}