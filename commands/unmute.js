const { start, verifyUser, checkMember, removeRole, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'unmute',
    description: 'Mention a user and that user will no longer be muted.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    await removeRole('muted')
                    await saveList();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}