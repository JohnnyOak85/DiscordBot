const { start, verifyUser, checkMember, addRole, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'mod',
    description: 'Mention a user and that user will be awarded with the moderator role.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'ADMINISTRATOR')) {
                if (checkMember()) {
                    await addRole('moderator')
                    await saveList();
                }
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}