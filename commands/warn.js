const { start, verifyUser, checkMember, giveStrike, saveList, sendReply, getReply } = require('../helpers/command.helper');
const { MAX_STRIKES } = require('../docs/config.json');

module.exports = {
    name: 'warn',
    description: `Mention a user and give it a strike. User will be muted after ${(MAX_STRIKES / 2)} strikes and banned after ${MAX_STRIKES}.`,
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args) {
        try {
            await start(message, args);

            if (verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (checkMember()) {
                    await giveStrike()
                    await saveList();
                };
            }

            await sendReply(message.guild.systemChannel, getReply());
        } catch (error) {
            throw error
        }
    }
}