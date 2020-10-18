const { MAX_STRIKES } = require('../docs/config.json');
module.exports = {
    name: 'warn',
    description: `Mention a user and give it a strike. User will be muted after ${(MAX_STRIKES / 2)} strikes and banned after ${MAX_STRIKES}.`,
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        try {
            await commandHelper.start(message, args);

            if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
                if (commandHelper.checkMember()) {
                    await commandHelper.giveStrike()
                    await commandHelper.saveList();
                };
            }

            await commandHelper.sendReply(message.guild, commandHelper.getReply());
        } catch (error) {
            throw error
        }
    }
}