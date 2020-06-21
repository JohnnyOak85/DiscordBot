const LIST_NAME = 'warned';
module.exports = {
    name: 'warn',
    description: 'Gives an infraction to a user. User will be muted after 3 infractions and banned after 5.',
    usage: '<user> <reason>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await commandHelper.addInfractor(LIST_NAME);
                await commandHelper.addInfractions(LIST_NAME, commandHelper.getReason());
                checkWarnings(infractor, commandHelper, message);
            };
        }
        message.channel.send(commandHelper.getReply());
    }
}

async function checkWarnings(infractor, commandHelper, message) {
    const list = await commandHelper.getList(LIST_NAME);
    const warnList = list[infractor.user.id].infractions.length;
    if (warnList > 4) {
        await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
        await commandHelper.addInfractor('banned');
        await commandHelper.startTimer('banned', 1, 'days');
    } else if (warnList > 2) {
        const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
        await commandHelper.addRole(role);
        await commandHelper.startTimer('muted', 30, 'minutes');
    }
    message.channel.send(commandHelper.getReply());
}