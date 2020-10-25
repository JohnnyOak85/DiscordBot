const { verifyUser, checkMember, addRole, saveMembers, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'mod',
    description: 'Mention a user and that user will be awarded with the moderator role.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            if (verifyUser(message.member, 'ADMINISTRATOR')) {
                if (checkMember()) {
                    await addRole('moderator')
                    await saveMembers();
                }
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}