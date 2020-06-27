const { MAX_INFRACTIONS } = require('../server-lists/config.json');
module.exports = {
    name: 'warn',
    description: 'Gives an infraction to a user. User will be muted after 3 infractions and banned after 5.',
    usage: '<user> <reason>',
    async execute(message, args, commandHelper) {
        commandHelper.start(message, args);
        if (commandHelper.verifyUser('MANAGE_MESSAGES')) {
            const infractor = await commandHelper.getInfractor();
            if (infractor) {
                await commandHelper.addInfractor('warned');
                await commandHelper.addInfraction('warned', commandHelper.getReason());
                checkWarnings(infractor, commandHelper, message);
            };
        }
    }
}

async function checkWarnings(infractor, commandHelper, message) {
    const list = await commandHelper.getList('warned');
    const warnNum = list[infractor.user.id].infractions.length;
    if (warnNum === MAX_INFRACTIONS) {
        await infractor.ban(commandHelper.getReason()).catch(error => { throw error });
        await commandHelper.addInfractor('banned');
        await commandHelper.startTimer('banned', 1, 'days');
    } else if (warnNum === (MAX_INFRACTIONS / 2)) {
        const role = await commandHelper.ensureRole('muted').catch(err => { throw err; });
        await commandHelper.addRole(role);
        await commandHelper.addInfractor('muted');
        await commandHelper.startTimer('muted', 30, 'minutes');
    }
    message.channel.send(commandHelper.getReply());
}