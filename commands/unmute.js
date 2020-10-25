const { verifyUser, checkMember, unmute, saveMembers, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    await unmute('muted')
                    await saveMembers();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}