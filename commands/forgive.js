const { start, verifyUser, checkMember, removeStrike, saveList, sendReply, getReply } = require('../helpers/command.helper');

module.exports = {
    name: 'forgive',
    description: 'Mention a user and that user will get a strike removed.',
    usage: '<user>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    removeStrike();
                    await saveList();
                }
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}