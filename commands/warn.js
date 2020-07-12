const { MAX_STRIKES } = require('../docs/config.json');
module.exports = {
    name: 'warn',
    description: `Mention a user and give it a strike. User will be muted after ${(MAX_STRIKES / 2)} strikes and banned after ${MAX_STRIKES}.`,
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser(message.member, 'MANAGE_MESSAGES')) {
            if (commandHelper.checkMember()) {
                await commandHelper.giveStrike()
                    .catch(err => { throw err; });
                await commandHelper.saveDoc();
            };
        }
        message.channel.send(commandHelper.getReply())
            .catch(err => { throw err; });
    }
}