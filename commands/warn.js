const { MAX_STRIKES } = require('../docs/config.json');
module.exports = {
    name: 'warn',
    description: `Mention a user and give it a strike. User will be muted after ${(MAX_STRIKES / 2)} strikes and banned after ${MAX_STRIKES}.`,
    usage: '<user> <reason>',
    moderation: true,
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                const list = await commandHelper.updateList();

                const warnNum = list[infractor.user.id].strikes.length;
                if (warnNum === MAX_STRIKES) {
                    await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
                    list[infractor.id].banned = true;
                    delete list[infractor.id].roles;

                    commandHelper.setReply(`${infractor.user.username} has been banned.\n${commandHelper.getReason()}`);
                    commandHelper.setReason(`Banned! ${commandHelper.getReason()}`);
                } else if (warnNum === (MAX_STRIKES / 2)) {
                    const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
                    await commandHelper.addRole(role);

                    commandHelper.setReply(`${infractor.user.username} has been muted.\n${commandHelper.getReason()}`);
                    commandHelper.setReason(`Muted! ${commandHelper.getReason()}`);
                }

                commandHelper.setReply(`${infractor.user.username} has been warned.\n${commandHelper.getReason()}`);
                commandHelper.setReason(`Warned! ${commandHelper.getReason()}`);
                await commandHelper.saveList(list);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}