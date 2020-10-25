const { verifyUser, checkMember, removeStrike, saveMembers, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    removeStrike();
                    await saveMembers();
                }
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}